from pynput.keyboard import Key, Controller
import argparse
import time

parser = argparse.ArgumentParser(description='Type line by line and press enter in between - to execute the command.')

parser.add_argument('-s','--sleep', type=int, default=3, help='time to sleep before typing')
parser.add_argument('-b','--breaks', type=float, default=0.05, help='time to sleep in between lines')
parser.add_argument('file', type=str, help='file to use')

args = parser.parse_args();

keyboard = Controller()
print("sleeping for " + str(args.sleep)  +  " seconds and executing")
time.sleep(args.sleep)
with open(args.file) as infile:
    for line in infile:
        keyboard.type(line.rstrip())
        keyboard.press(Key.enter)
        keyboard.release(Key.enter)
        time.sleep(args.breaks)