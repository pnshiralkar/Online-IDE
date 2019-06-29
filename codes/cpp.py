import subprocess
import os
<<<<<<< HEAD

subprocess.call("cd codes\ng++ code.cpp 2> out.txt", shell=True)

f = open("./codes/out.txt", "rt")
if(f.read() == ""):
    inp = open("./codes/inp.txt", "rt").read()
    try:
        proc = subprocess.run(["./codes/a.out"], timeout=3, input=inp.encode('utf-8'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        op = open("./codes/out.txt", "w")
        op.write(str(proc.stdout.decode()))
    except subprocess.TimeoutExpired:
        op = open("./codes/out.txt", "w")
=======
import sys

dir = sys.argv[1]

subprocess.call("cd codes/" + dir + "\ng++ code.cpp 2> out.txt", shell=True)

f = open("./codes/" + dir + "/out.txt", "rt")
if(f.read() == ""):
    inp = open("./codes/" + dir + "/inp.txt", "rt").read()
    try:
        proc = subprocess.run(["./codes/" + dir + "/a.out"], timeout=3, input=inp.encode('utf-8'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        op = open("./codes/" + dir + "/out.txt", "w")
        op.write(str(proc.stdout.decode()))
    except subprocess.TimeoutExpired:
        op = open("./codes/" + dir + "/out.txt", "w")
>>>>>>> 09dd65d1ea43b9aff08813c8a149ac5a4c8c0e51
        op.write("Process terminated due to Timeout (3s)")
        print("Process terminated due to Timeout (3s)")

else:
    print(f.read())
