import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  dialog,
  ipcMain,
  shell,
  screen
} from "electron";

import "../renderer/store";
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  let size = screen.getPrimaryDisplay().workAreaSize;
  let width = parseInt(size.width * 0.7);
  let height = parseInt(size.height * 0.7);

  mainWindow = new BrowserWindow({
    useContentSize: true,
    height,
    width
  });

  // 创建子window
  // let child = new BrowserWindow({
  //   parent: mainWindow,
  //   modal: false,
  //   show: true
  // });
  // child.loadURL(`https://www.baidu.com`);

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  /**
   * @主进程向渲染进程 通信
   */
  //  导航完成时触发，即选项卡的旋转器将停止旋转，并指派onload事件后。
  mainWindow.webContents.on("did-finish-load", () => {
    // 发送数据给渲染程序
    mainWindow.webContents.send("something", "主进程发送到渲染进程的数据");
  });

  setCustomMenu();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * @description 渲染进程 向 主进程  通信创建右键菜单
 */
ipcMain.on("sigShowRightClickMenu", event => {
  const menu = new Menu();
  menu.append(new MenuItem({ label: "Hello world" }));
  menu.append(new MenuItem({ type: "separator" }));
  menu.append(
    new MenuItem({
      label: "Electron",
      click: () => {
        shell.openExternal("https://www.baidu.com");
      }
    })
  );
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup(win);
  console.log(`ipcRenderer main`);
});
// 异步
ipcMain.on("asynchronous-message", (event, arg) => {
  console.log(arg); // prints "ping"
  event.sender.send("asynchronous-reply", "pong");
});
// 同步
ipcMain.on("synchronous-message", (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = "pong";
});

/**
 * @description Set menu to window in main
 * @todo to be a component
 */
function setCustomMenu() {
  // Initial menu options
  let template = [
    {
      label: "操作",
      submenu: [
        {
          label: "复制",
          accelerator: "CmdOrCtrl+C",
          role: "copy"
        },
        {
          label: "粘贴",
          accelerator: "CmdOrCtrl+V",
          role: "paste"
        },
        {
          label: "重新加载",
          accelerator: "CmdOrCtrl+R",
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              // on reload, start fresh and close any old
              // open secondary windows
              if (focusedWindow.id === 1) {
                BrowserWindow.getAllWindows().forEach(function(win) {
                  if (win.id > 1) {
                    win.close();
                  }
                });
              }
              focusedWindow.reload();
            }
          }
        }
      ]
    },
    {
      label: "加载网页",
      submenu: [
        {
          label: "优酷",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            console.log("time to print stuff");
          }
        },
        {
          type: "separator"
        },
        {
          label: "百度"
        }
      ]
    }
  ];
  // mac 固定的格式
  if (process.platform === "darwin") {
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: `关于 ${name}`,
          role: "about"
        },
        {
          type: "separator"
        },
        {
          label: "服务",
          role: "services",
          submenu: []
        },
        {
          type: "separator"
        },
        {
          label: `隐藏 ${name}`,
          accelerator: "Command+H",
          role: "hide"
        },
        {
          label: "隐藏其它",
          accelerator: "Command+Alt+H",
          role: "hideothers"
        },
        {
          label: "显示全部",
          role: "unhide"
        },
        {
          type: "separator"
        },
        {
          label: "退出",
          accelerator: "Command+Q",
          click: function() {
            app.quit();
          }
        }
      ]
    });
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setRightMenu() {
  //! 生成菜单
  const menu = new Menu();
  menu.append(new MenuItem({ label: "右键自定义菜单" }));
  menu.append(new MenuItem({ type: "separator" }));
  menu.append(
    new MenuItem({
      label: "百度",
      click: () => {
        Electron.shell.openExternal("https://www.baidu.com");
      }
    })
  );
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup(win);
}

/**
 * @description dialog
 */
function _dialog() {
  dialog.showMessageBox({
    type: "info",
    message: "你按下了" + process.platform
  });
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
