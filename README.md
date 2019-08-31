# Online IDE in Node.js
 Code,compile and run code online!<br/>
 Creates an express server for the IDE, which can be accessed and used by multiple users at the same time.<br/>
 Supported languages - C, C++, Java, Python3.<br/>
 Also supports timeout of 3sec for long processess.
 
 
# Installation - 
Clone this Repo and extract it to a folder. Make sure you have latest version of g++, java, and python3 on your system. Also ensure that you have Node.js v12 or higher. <br/>
<ol>
 <li>Update and upgrade your apt if not done recently - <code>sudo apt-get update && sudo apt-get upgrade</code></li>
 <li> Install Node.js - <ol>
  <li>Install curl - <code>sudo apt install curl</code></li>
  <li>Install NVM(Node Version manager, easiest way to install Node.js) - <br/><code>curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash</code>
  <li>Restart terminal and install Node.js 12 - <code>nvm install 12</code></li>
  </ol></li>
 <li>Install g++ - <code>sudo apt-get install g++</code></li>
 <li>Install Java Compiler - <code>sudo apt install default-jdk</code></li>
 <li>Install Python3 - <code>sudo apt-get install python3</code></li>
 <li>Clone this Repo into desired folder (directly download & extract zip OR <br/><code>git clone https://github.com/pnshiralkar/Online-IDE.git</code></li>
 <li>Change directory (cd) into the cloned folder</li>
 <li>The IDE Server is now installed and setup. </li>
</ol>
<br>

# Run the server - 
<code>node cppide.js</code> OR <code>node .</code>
<br/>
This will start the IDE server at <code> <your_ip>:8080</code> (and, also) <code>127.0.0.1:8080</code>.You can check if this link works in browser.<br/>
Happy Coding!
 
 # Technologies used
 Node.js, Python, HTML, CSS, Javascript, jQuery, Bootstrap, Bash.
