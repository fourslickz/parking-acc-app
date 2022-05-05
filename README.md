# parking-acc-app

## Setup
create file c:\parking.json
{
    "company": "ninja"
}

## Issue
if you run this repo and got error `usb.on` not function you should remove or disabled this code.
Open file `node_modules/escpos-usb/index.js`, then search this code and comment this on line `52`

```bash
usb.on('detach', function(device){
  if(device == self.device) {
  self.emit('detach'    , device);
  self.emit('disconnect', device);
  self.device = null;
  }
});
```

and line `169`

```bash
usb.removeAllListeners('detach');
```


## Referrences
https://github.com/revell29/electron-print-service