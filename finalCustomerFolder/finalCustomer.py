#CUSTOMER CODE

import pathlib
import time
import os
import glob

from freewili import FreeWili
from freewili.image import convert
from freewili.framing import ResponseFrame
from freewili.types import EventDataType, EventType, IRData, ButtonData
from freewili.fw import FreeWiliProcessorType as FwProcessor


#Socket things
from zip_receiver import restart_socket_and_listen_again
from zip_receiver import ZipFileReceiver
import threading
#CUSTOMER ID (RED)

color = "R"
def getID():
    return ("C" + color).encode("utf-8")

lights = {
    "R": (255, 0, 0),   # Red
    "B": (0, 0, 255),   # Blue
    "G": (0, 255, 0),   # Green
    "Y": (255, 255, 0), # Yellow
    "O": (255, 69, 0),  # Orange
    "P": (255, 70, 80), # Pink
    "W": (10, 10, 10),  # White
    "X": (0, 0, 0)
}

# find FW and open
device = FreeWili.find_first().expect("failed to find a freewili")
device.open().expect("failed to open")


def set_lights(dev, light):
    for i in range(7):
        dev.set_board_leds(i, light[0], light[1], light[2])


def filemk(fileName, n, end):
    return f"{fileName}{n}.{end}"

shopping = True
currFi = 0
numFiles = 0
nameFile = ""

def fileUpload(fileName, totalFileNum):
    global numFiles, nameFile
    numFiles = totalFileNum
    nameFile = fileName
    for i in range(totalFileNum):
        convert(filemk(fileName, i, "png"), filemk(fileName, i, "fwi"))
        print(fileName, i)
        my_fwi_file = pathlib.Path(filemk(fileName, i, "fwi"))
        device.send_file(my_fwi_file, None, None)
    print("done w/ picture upload")
    device.set_board_leds(6, 10, 10, 10)
    
def change_image(dev, fileName):
    global currFi, numFiles, shopping
    if currFi < numFiles:
        dev.show_gui_image(filemk(fileName, currFi, "fwi"))
        currFi = currFi + 1
    else:
        currFi = 0
        shopping = False
        
    
#define event handler
def event_callback(event_type: EventType, response_frame: ResponseFrame, event_data: EventDataType) -> None:
    global shopping
    if isinstance(event_data, IRData):
        print(f"IR RX {len(event_data.value)}: {event_data.value!r}")
        if len(event_data.value) == 2:
            empID = event_data.value.decode("utf-8")
            if empID[0] == "E" and empID[1] == color:
                set_lights(device, lights["X"])

    if isinstance(event_data, ButtonData):
        if event_data.blue:
            device.send_ir(getID())
            set_lights(device, lights[color])
        if event_data.yellow:
            # lol = "CB"
            # lol2 = lol.encode("utf-8")
            # custID["color"] = "B"
            # custID["enc"] = lol2
            change_image(device, nameFile)
        if event_data.gray:
            set_lights(device, lights["X"])
            shopping = False
            
# reset LEDs
set_lights(device, lights["X"])

# image upload
# convert("done.png", "done.fwi")
# convert("start.png", "start.fwi")
my_fwi_file = pathlib.Path(r"done.fwi")
device.send_file(my_fwi_file, None, None)
my_fwi_file = pathlib.Path(r"start.fwi")
device.send_file(my_fwi_file, None, None)
device.show_gui_image("start.fwi")
# print("Done w/ picture upload")
#device.show_gui_image("wojak1.fwi")
# fileUpload("route_step_0", 6)
# device.show_gui_image(filemk(nameFile, 0, "fwi"))
# color = "G"


# # event call back setup
# device.set_event_callback(event_callback)
# device.enable_ir_events(True)
# device.enable_button_events(True)
startup = True

# delete png files
for filename in glob.glob("route_step_0*.png"):
    # Ensure the part after "file" is a number before deleting
    name = filename.removeprefix("route_step_0").removesuffix(".png")
    if name.isdigit():
        os.remove(filename)
        print(f"Deleted {filename}")
#delete fwi
for filename in glob.glob("route_step_0*.fwi"):
    # Ensure the part after "file" is a number before deleting
    name = filename.removeprefix("route_step_0").removesuffix(".fwi")
    if name.isdigit():
        os.remove(filename)
        print(f"Deleted {filename}")

        
restart_socket_and_listen_again()

for filename in glob.glob("route_step_0*.png"):
    name = filename.removeprefix("route_step_0").removesuffix(".png")
    if name.isdigit():
        numFiles += 1
print(numFiles)

while True:
    if shopping:
        if startup:
            set_lights(device, lights["X"])
            device.show_gui_image("start.fwi")
            fileUpload("route_step_0", numFiles)
            color = "G"

            # event call back setup
            device.set_event_callback(event_callback)
            device.enable_ir_events(True)
            device.enable_button_events(True)
            startup = False
        device.process_events()
    else:
        # delete png files
        for filename in glob.glob("route_step_0*.png"):
            # Ensure the part after "file" is a number before deleting
            name = filename.removeprefix("route_step_0").removesuffix(".png")
            if name.isdigit():
                os.remove(filename)
                print(f"Deleted {filename}")
        #delete fwi
        for filename in glob.glob("route_step_0*.fwi"):
            # Ensure the part after "file" is a number before deleting
            name = filename.removeprefix("route_step_0").removesuffix(".fwi")
            if name.isdigit():
                os.remove(filename)
                print(f"Deleted {filename}")
        
        device.show_gui_image("done.fwi")
        device.set_board_leds(6, 0, 0, 0)
        print("Shopping Completed")
        restart_socket_and_listen_again()
        print("here")
        numFiles = 0
        for filename in glob.glob("route_step_0*.png"):
            name = filename.removeprefix("route_step_0").removesuffix(".png")
            if name.isdigit():
                numFiles += 1
        shopping = True
        
        startup = True

device.close()