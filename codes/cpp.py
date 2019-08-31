import subprocess
import os
import sys

dir = sys.argv[1]

subprocess.call("cd codes/" + dir + "\ng++ code.cpp 2> out.txt", shell=True)

f = open("./codes/" + dir + "/out.txt", "rt")
if(f.read() == ""):
    inp = open("./codes/" + dir + "/inp.txt", "rt").read()
    try:
        proc = subprocess.run(["./codes/" + dir + "/a.out"], timeout=3, input=inp.encode('utf-8'),capture_output=True, check=True)
        op = open("./codes/" + dir + "/out.txt", "w")
        op.write(str(proc.stdout.decode()))
    except subprocess.TimeoutExpired:
        op = open("./codes/" + dir + "/out.txt", "w")
        op.write("Process terminated due to Timeout (3s)")
        print("Process terminated due to Timeout (3s)")
    except subprocess.CalledProcessError as e:
        op = open("./codes/" + dir + "/out.txt", "w")
        op.write("RuntimeError: " + str(e).split("]")[1].split("<Signals.")[1].split(":")[0])
        print(".")

else:
    print(f.read())
