# zip_receiver.py
# Server code for RECEIVING zip files and extracting images
# This runs on the computer that runs the WILIIIIIIIIIII

import socket
import threading
import zipfile
import tempfile
import os

class ZipFileReceiver:
    def __init__(self, host='0.0.0.0', port=9999, allowed_ips=None, on_images_received=None, stop_after_receive=False):
        self.host = host
        self.port = port
        self.server_socket = None
        self.running = False
        self.allowed_ips = allowed_ips or []  # List of allowed IP addresses
        self.on_images_received = on_images_received  # Callback function
        self.total_images_received = 0  # Track total images received
        self.stop_after_receive = stop_after_receive  # Stop server after receiving images
    
    def start_server(self):
        #Start the socket server to receive zip files
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(1)  # Only need 1 connection
            self.running = True
            print(f"Waiting for zip files on {self.host}:{self.port}")
            print(f"Images will be saved to current directory: {os.getcwd()}")
            
            # Accept ONE connection and handle it directly (no threading)
            client_socket, addr = self.server_socket.accept()
            print(f" Connection from {addr}")
            
            # Handle the client directly in this thread
            self.handle_client_direct(client_socket, addr)
            
            # If stop_after_receive is True, we're done after one connection
            if self.stop_after_receive:
                print(" Finished receiving images.")
                return
                
        except KeyboardInterrupt:
            print("Server stopped by user")
        except Exception as e:
            print(f"Server error: {e}")
        finally:
            self.stop_server()
    
    def stop_server(self):
        #shut the server down
        self.running = False
        if self.server_socket:
            self.server_socket.close()
    
    def handle_client_direct(self, client_socket, addr):
        #Handle incoming zip file from client - direct version
        try:
            # Check IP whitelist first
            client_ip = addr[0]
            if self.allowed_ips and client_ip not in self.allowed_ips:
                print(f" Blocked connection from unauthorized IP: {client_ip}")
                return
            
            # Receive and verify authentication token
            auth_data = client_socket.recv(32)
            if not auth_data:
                print(f" No auth token from {addr}")
                return
            
            auth_token = auth_data.decode().strip()
            expected_token = "CelestAisle2025"
            
            if auth_token != expected_token:
                print(f" Invalid auth token from {addr}: '{auth_token}'")
                client_socket.send("NO".encode())
                return
            
            print(f"Valid auth token from {addr}")
            client_socket.send("OK".encode())
            
            # Receive file size
            size_data = client_socket.recv(8)
            if not size_data:
                return
            file_size = int.from_bytes(size_data, 'big')
            print(f" Expecting zip file of {file_size} bytes from {addr}")
            
            # Receive the zip file data
            zip_data = b''
            received = 0
            
            while received < file_size:
                chunk = client_socket.recv(min(4096, file_size - received))
                if not chunk:
                    break
                zip_data += chunk
                received += len(chunk)
                progress = received / file_size * 100
                print(f" Progress: {received}/{file_size} bytes ({progress:.1f}%)")
            
            print(f"Received complete zip file ({len(zip_data)} bytes)")
            
            # Process the zip file
            result = self.process_zip_file(zip_data)
            
            # Send response back to client
            response = f" Extracted {result['image_count']} images successfully!"
            client_socket.send(response.encode())
            print(f"Sent confirmation to {addr}")
            
        except Exception as e:
            print(f" Error handling client {addr}: {e}")
            error_msg = f" Error: {str(e)}"
            try:
                client_socket.send(error_msg.encode())
            except:
                pass
        finally:
            client_socket.close()
    
    def handle_client(self, client_socket, addr):
        #Handle incoming zip file from client
        try:
            # Check IP whitelist first
            client_ip = addr[0]
            if self.allowed_ips and client_ip not in self.allowed_ips:
                print(f"Blocked connection from unauthorized IP: {client_ip}")
                return
        
            # Receive and verify authentication token
            auth_data = client_socket.recv(32)
            if not auth_data:
                print(f"No auth token from {addr}")
                return
            
            auth_token = auth_data.decode().strip()
            expected_token = "CelestAisle2025"
            
            if auth_token != expected_token:
                print(f"Invalid auth token from {addr}: '{auth_token}'")
                client_socket.send("NO".encode())
                return
            
            print(f"Valid auth token from {addr}")
            client_socket.send("OK".encode())
            
            # Receive file size
            size_data = client_socket.recv(8)
            if not size_data:
                return
            file_size = int.from_bytes(size_data, 'big')
            print(f"Expecting zip file of {file_size} bytes from {addr}")
            
            # Receive the zip file data
            zip_data = b''
            received = 0
            
            while received < file_size:
                chunk = client_socket.recv(min(4096, file_size - received))
                if not chunk:
                    break
                zip_data += chunk
                received += len(chunk)
                progress = received / file_size * 100
                print(f"Progress: {received}/{file_size} bytes ({progress:.1f}%)")
            
            print(f"Received complete zip file ({len(zip_data)} bytes)")
            
            # Process the zip file
            result = self.process_zip_file(zip_data)
            
            # Send response back to client
            response = f"Extracted {result['image_count']} images successfully!"
            client_socket.send(response.encode())
            print(f"Sent confirmation to {addr}")
            
            # Stop server if requested
            if self.stop_after_receive:
                print("Stopping server after receiving images...")
                self.running = False
                # Close server socket to break out of accept() loop
                if self.server_socket:
                    self.server_socket.close()
            
        except Exception as e:
            print(f"Error handling client {addr}: {e}")
            error_msg = f"Error: {str(e)}"
            try:
                client_socket.send(error_msg.encode())
            except:
                pass
        finally:
            client_socket.close()
    
    def process_zip_file(self, zip_data):
        #Extract images from the received zip file to current directory

        extracted_count = 0
        
        try:
            # Create a temporary file for the zip data
            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_zip:
                temp_zip.write(zip_data)
                temp_zip_path = temp_zip.name
            
            print(f"Extracting zip file...")
            
            # Open and extract the zip file
            with zipfile.ZipFile(temp_zip_path, 'r') as zip_file:
                for filename in zip_file.namelist():
                    if filename.lower().endswith(('.png')):
                        try:
                            # Extract image directly to current directory
                            safe_filename = filename.replace('/', '_').replace('\\', '_')
                            
                            # Read image data and save to current directory
                            image_data = zip_file.read(filename)
                            with open(safe_filename, 'wb') as f:
                                f.write(image_data)
                            
                            extracted_count += 1
                            print(f"Extracted: {safe_filename}")
                            
                        except Exception as e:
                            print(f"Error extracting image {filename}: {e}")
            
            # Clean up temporary file
            os.unlink(temp_zip_path)
            
            print(f"Extraction complete! {extracted_count} images saved to current directory.")
            
            # Update total count
            self.total_images_received += extracted_count
            
            # Call callback function if provided
            if self.on_images_received:
                try:
                    self.on_images_received(extracted_count)
                except Exception as e:
                    print(f"Callback error: {e}")
            
        except Exception as e:
            print(f"Error processing zip file: {e}")
        
        return {'image_count': extracted_count}
    
    def get_images_count(self):
        #Get the total number of images received
        return self.total_images_received
    
# Global receiver instance
_global_receiver = None

def restart_socket_and_listen_again():
    #restart the socket
    global _global_receiver
    
    print("Waiting for zip file...")
    _global_receiver = ZipFileReceiver(port=9999, stop_after_receive=True)
    _global_receiver.start_server()  # This blocks until images are received
    
    print("Images received! Continuing...")
    return _global_receiver

# Run the server
if __name__ == "__main__":
    receiver = ZipFileReceiver(port=9999)  # , allowed_ips=allowed_ips)
    
    try:
        receiver.start_server()
    except KeyboardInterrupt:
        print("\nGoodbye!")
    except Exception as e:
        print(f"Fatal error: {e}")
