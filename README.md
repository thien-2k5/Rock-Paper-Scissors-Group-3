# Multi-Threaded Rock Paper Scissors Game
## ACM Open Project - Summer 2022

I am Jothi Krishnan M, an ECE department sophomore of IIT Roorkee. This repository of mine is my submission to the ACM Open Project on the topic [Multi-Threaded Servers](https://hackmd.io/@node0/SyK5D0Dv9).

In this open project, I have used the concepts that have been taught to us over the span of 3 weeks about servers and threads to create a Muli-Threaded Rock Paper Scissors Game using python. In this game, a user can play with an opponent who is connected to our network and not necessarily on the same device that server is running. 

## Table of contents

- [Overview](#overview)
  - [Task Given](#task-given)
  - [Description of my work](#description-of-my-work)
- [Internal Working](#internal-working)
- [Setup Guide](#setup-guide)
  - [Procedure to run this project](#procedure-to-run-this-project)
  - [Video Demo](#video-demo)
- [Key Learnings from this project](#key-learnings-from-this-project)
- [Some Resources](#some-resources)
- [Contact Me](#contact-me)


## Overview

### Task Given
In this open project, we were taught about threads, servers and how to combine them to create a multithreaded server. By using this general idea of multi-threaded servers we were asked to create a use case for this multi-threaded server. This given project is language independent and allowed us to use any threaded library in our project. This projct needed to have a Mutex Lock in it as well.
### Description of my work
What better use-case can be than a simple game that is implemented using the multi-threaded server. I have implemented a multi-server Rock Paper Scissors Game in python. This game will completely change the way you play the game Rock Paper Scissors game in your future. This allows players to join the server from different device that is connected to the same network and not necessarily on the same device as the server. 

## Internal Working

A brief description of the Internal Working of this project is given here. 

A server is started with IPv4 address unique to your network. This allows the clients connected with the same network to join the server even on a different device. Then once the server is starts at this address with a random port 5555, it waits for clients to connect.
Once the clients are connected, the data is encoded and are transmitted from the server to the client and from the client to the server. Whenever a client is connected, a new thread is created with python library "threading" and a new instance of a class called Game is created when the connected client is player1 and if it is player2, the instance of player1 is used.
The game is created using a python library called Pygame and sending and receiving of data from the server to the client is done by another library called Pickle.
At each stage of the game, data is passed from client to server as each player makes a move. For example, to decide which player is player1 and player2 we require data from server, to reset the game once a round between them is over, as a client clicks a button and to send his choice to the server, when a player has quit the game etc.
The server then interprets the received data and makes changes accordingly. The server then sends the responce back to client to show it in the pygame window.

## Setup Guide

### Procedure to run this project
This project is made by using Python. Before you run this project make sure that you have Python installed in your machine.

Python Libraries used in this project:

- pygame
- socket
- threading
- pickle

Out of which, only pygame doesn't come along with python. So check if you have pygame library in your system. If not, run "pip install pygame" in windows and mac, run "sudo apt-get install python-pygame" in linux in terminal to install it. You can refer [Pygame Documentation - Getting Started](https://www.pygame.org/wiki/GettingStarted).

Steps to be followed:

- Clone this repository to your local system.
- Copy and Paste your IPv4 address in the specified lines in client.py and server.py
    - If you are using windows then, open your command prompt and run the command "ipconfig", in the resulting screen you can see your IPv4 address.
    - If you are using Linux, then the easiest way is to open the Network settings. [How to find Ip addresses in Linux](https://opensource.com/article/18/5/how-find-ip-address-linux)
    - If you are using mac, you can refer to the Network Preferences tab. [Finding the Ip in Mac](https://kb.wisc.edu/helpdesk/page.php?id=6526)
- Now run the command "python server.py" file in a terminal. (Now the server is started)
- For creating a client(a player), run "python client.py" in a terminal.
- Enjoy Playing.

### Video Demo

The Video Tutorial of this Open Project can be found [Here](https://drive.google.com/file/d/1iiPgy35yY3NOZ4RKY2KX_OKq4KEJ2JEn/view?usp=sharing).

Hope You guys have understood how to run this project.

## Key Learnings from this project

Few of the thing that I have learnt from this project are:

- Working of threads and servers
- Implementing a Multi-threaded server
- Creating a game in python using Pygame.
- Working of Sockets

Other than these, working on an Open Project with a deadline is relatively new experience for me personally, which I totally loved as it gave me an experience of working as a developer.

## Some Resources

Some of the resources that I found useful while making the project are:

- GeeksForGeeks- I refered it for the following topics: [Threads](https://www.geeksforgeeks.org/thread-functions-in-c-c/), [Mutex Lock](https://www.geeksforgeeks.org/mutex-lock-for-linux-thread-synchronization/), [Socket](https://www.geeksforgeeks.org/socket-programming-cc/), [Multi-threaded Server](https://www.geeksforgeeks.org/handling-multiple-clients-on-server-with-multithreading-using-socket-programming-in-c-cpp/), 
- [Pygame Documentation](https://www.pygame.org/docs/)
- Additionally for Threading library I referred: [threading docs](https://docs.python.org/3/library/asyncio-sync.html), [Mutex Lock in threading](https://superfastpython.com/thread-mutex-lock/#:~:text=A%20mutex%20lock%20can%20be,section%20and%20releases%20the%20lock.), [Intro to threading in python](https://realpython.com/intro-to-python-threading/)
- For Pickle Library I referred GeeksforGeeks and pickle Documentation, [Understading Pickle](https://www.geeksforgeeks.org/understanding-python-pickling-example/), [Pickle Documentation](https://docs.python.org/3/library/pickle.html)

## Contact Me

This project is done by Jothi Krishnan M, a sophomore in the ECE department of IIT Roorkee.
My Github account is mentioned below. Feel free to contact me for any comments in the project or to simply have a chat over a cup of coffee.
- Github [@Jothi-krishnan](https://github.com/Jothi-krishnan)
- My Email id : jothikrishnan2002@gmail.com & jothi_km@ece.iitr.ac.in

