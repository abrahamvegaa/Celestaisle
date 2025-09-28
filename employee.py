import pathlib
import time
from freewili import FreeWili
from queue import Queue
from freewili.image import convert
from freewili.framing import ResponseFrame
from freewili.types import EventDataType, EventType, IRData, ButtonData

q = Queue(maxsize=7)
colors = {
    "R": (255, 0, 0),   # Red
    "B": (0, 0, 255),   # Blue
    "G": (0, 255, 0),   # Green
    "Y": (255, 255, 0), # Yellow
    "O": (255, 69, 0),  # Orange
    "P": (255, 70, 80), # Pink
    "W": (10, 10, 10),  # White
    "N": (0, 0, 0),     # Off
}

device = FreeWili.find_first().expect("Could not find")
device.open() #.expect("Failed to open")
for i in range(7):
    device.set_board_leds(i, 0, 0, 0)

# set callback
def event_callback(event_type: EventType, response_frame: ResponseFrame, event_data: EventDataType) -> None:
    global q
    if isinstance(event_data, IRData):        
        print(f"IR RX {len(event_data.value)}: {event_data.value!r}")
        if len(event_data.value) == 2:
            rxd = event_data.value.decode("utf-8")
            if rxd[0] == 'C': 
                q.put(rxd[1])
                set_color(q.qsize()-1, rxd[1])
#                device.set_board_leds(q.qsize() - 1, 255, 0, 0)
                print("put "+rxd[1]+" into queue")

    if isinstance(event_data, ButtonData):
        print(f"Button RX blue: {event_data.blue!r}")
        if not q.empty() and event_data.blue:
            t = q.get()
            print("removed "+t+" from queue")
            temp = "E"+t
            device.send_ir(temp.encode("utf-8"))
            items = list(q.queue)  # snapshot without consuming
            for i in range(7):
                
                if i < len(items):
                    set_color(i, items[i])  # set color of LED i
                    # print(items[i])
                else:
                    set_color(i, "N") 


def set_color(pin, color):
    if color in colors:
        tup = colors[color]
        print("tup: ", tup[0], tup[1], tup[2])
        device.set_board_leds(pin, tup[0], tup[1], tup[2])

# upload image
convert("employee.png", "employee.fwi")
my_fwi_file = pathlib.Path(r"employee.fwi")
device.send_file(my_fwi_file, None, None)
device.show_gui_image("employee.fwi")

device.set_event_callback(event_callback)
device.enable_button_events(True)
device.enable_ir_events(True)

print("READY!")


while True:
    device.process_events()

device.close()