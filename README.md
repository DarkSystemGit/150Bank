# Doge Bank (150Bank)

Doge Bank is a experiment created as a joke about creating you own economy to use with your friends
 
## Installation

Use the  [git](https://git-scm.com/) to install Doge Bank.
Also download the [UIkit](https;//getuikit.com) CSS libary and move its CSS files into the /css folder. The same with the JS files, except you move them to the /js folder.

```bash
#Debian based Linux Distros
sudo apt-get install zip unzip -y
# RHEL, Rocky Linux, and Fedora 
dnf install zip unzip -y
#Cloning repo
git clone https://github.com/DarkSystemGit/150Bank.git
#UIkit download
wget https://github.com/uikit/uikit/releases/download/v3.16.15/uikit-3.16.15.zip
#If you don't use Linux, just google how to unzip from the command line
unzip ./uikit-3.16.15.zip
cd ./uikit-3.16.15
mv ./css/* ./../150Bank/css/
mv ./js/* ./../150Bank/js/
cd ./../
npm install ./150Bank/
```

## Usage

```bash
#This assumes your in the directory where you cloned the project
cd ./150Bank
#To Start the Main Server
node ./server/main.js
#Session Management
node ./server/session.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

I would caution you to use a Large Learning Model such as [ChatGPT](https://chat.openai.com) or Google's [Bard](https://bard.google.com) to try to understand the code, because I had no time to comment and clean it up. If you choose not, then I wish you the best of luck beacuse this repo is a mess. (I have a personal deadline of May 15th)  

## Future
After the inital relase it will be hosted on [Heroku](https://www.heroku.com) for a time. I will be updating the project till June 28th. Past then, I really don't know.



## License

[MIT](https://choosealicense.com/licenses/mit/)
