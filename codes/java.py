import subprocess
import os
import sys

dir = sys.argv[1]

subprocess.call("cd codes/" + dir + "\njavac code.java 2> out.txt", shell=True)

f = open("./codes/" + dir + "/out.txt", "rt")
if(f.read() == ""):
    inp = open("./codes/" + dir + "/inp.txt", "rt").read()
    try:
        proc = subprocess.run(["java", "-cp", "codes/" + dir, "code"], timeout=3, input=inp.encode('utf-8'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        op = open("./codes/" + dir + "/out.txt", "w")
        if(str(proc.stderr.decode()) == ""):
	        op.write(str(proc.stdout.decode()))
        else:
	        op.write(str(proc.stderr.decode()))
	        print(".")
    except subprocess.TimeoutExpired:
        op = open("./codes/" + dir + "/out.txt", "w")
        op.write("Process terminated due to Timeout (3s)")
        print("Process terminated due to Timeout (3s)")

else:
    print(f.read())
