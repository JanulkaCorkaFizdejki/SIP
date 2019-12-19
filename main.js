const electron = require('electron');
const path = require('path');
const url = require('url');
const sip = require('jssip');
const {DB_Manager} = require('./db_manager');
const {AppSettings} = require('./appSettings');
const { ipcRenderer } = require('electron');


// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let addContactWindow;
let addContactListWindow;

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html in window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes:true
    })
  );

  // Quit app when closed
  mainWindow.on('closed', function() {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// APP WINDOWS
//_________________________________________________________
function createAddUserWindow(){
  addWindow = new BrowserWindow({
    width: 400,
    height:400,
    title:'Add USER'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });

  addWindow.setMenuBarVisibility(false)
}
//. 
function createAddContactsWindow (){
  addContactWindow= new BrowserWindow({
    width: 400,
    height:400,
    title:'Add CONTACT'
  });
  addContactWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addContactWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addContactWindow.on('close', function(){
    addContactWindow = null;
  });

  addContactWindow.setMenuBarVisibility(false);
}

function createAddContactsListWindow (){


    
  addContactListWindow = new BrowserWindow({
    width: 400,
    height:400,
    title:'Contact List'
  });
  addContactListWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'test.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addContactListWindow.on('close', function(){
    addWindow = null;
  });

  //ipcMain.on('store-data', () => {
    addContactListWindow.webContents.send('store-data', "hallo")
  //})

  addContactListWindow.setMenuBarVisibility(false);
}
// *** END RENDERER WIN APP
// __________________________________________________________


// Catch item:add
ipcMain.on('item:add', function(e, name, any_data, winDestination){
  mainWindow.webContents.send('item:add', name, any_data, winDestination);
  // DB
  const appSett = new AppSettings();
  const db = new DB_Manager(appSett.base_db);

  switch(winDestination) {
          case appSett.win_destinantion.WINADDCONTACT:
              db.insert("INSERT INTO contacts(name, number) VALUES ('" + name + "', '"+ any_data + "')");
              // addContactWindow.close()
              break;
          case appSett.win_destinantion.WINADDUSER:
              db.insert("INSERT INTO users(name, password) VALUES ('" + name + "', '"+ any_data + "')");
              addWindow.close(); 
              break;
          default:
              console.error("Incorrect parametr into fn.win.add.db()")
  }
  db.close();
});

ipcMain.on('sip:call', function () {

});




// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'Start',
    submenu:[
      {
        label:'Add User',
        click(){
          createAddUserWindow();
        }
      },
      {
        label:'Add Contact',
        click(){
          createAddContactsWindow();
        }
      },
      {
        label:'Contact List',
        click(){
          createAddContactsListWindow();
         
        }
      },
      {
        label:'Remove User',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}