import subprocess
import os
import sys

dir = sys.argv[1]


inp = open("./codes/" + dir + "/inp.txt", "rt").read()
try:
    proc = subprocess.run(["python3", "codes/" + dir + "/code.py"], timeout=3, input=inp.encode('utf-8'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    op = open("./codes/" + dir + "/out.txt", "w")
    if not str(proc.stderr.decode()):
    	op.write(str(proc.stdout.decode()))
    else:
    	op.write(str(proc.stderr.decode()))
    	print(str(proc.stderr.decode()))
except subprocess.TimeoutExpired:
    op = open("./codes/" + dir + "/out.txt", "w")
    op.write("Process terminated due to Timeout (3s)")
    print("Process terminated due to Timeout (3s)")
