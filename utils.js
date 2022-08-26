$(document).ready(() => {
  loadServersStatus();
})

// Refresh every 30 sec (doesn't work, yet, because it just adds new rows instead of updating them)
// var intervalId = window.setInterval(function(){
//   loadServersStatus();
// }, 30000);

const getRowByValue = (value) => {
  let foundRow = false;
  const table = document.getElementById("serversStatus");
  for (const row of table.rows) {
    for (const cell of row.cells) { 
      console.log(cell.innerText) 
      if (cell.innerText == value) {
        foundRow = true;
        break;
      }
    }
    if (foundRow) return row;
  }

  return null;
}

const refreshServerTableRow = async (address) => {
  let serverStatus = await $.get("https://api.mcsrvstat.us/2/" + address).fail((error) => { console.log(error) })
  // console.log(serverStatus)
  
  let iconCellValue = "<img src=\"" + serverStatus?.icon + "\" alt=\"icon for server\" />";
  let addressCellValue = address + "<br/>" + serverStatus.motd.html;
  let players = serverStatus?.players;
  let playersOnlineCellValue = "(" + players?.online + "/" + players?.max + ") " + (players?.list ? players?.list : "");

  // Check if row already exists
  let row = getRowByValue(addressCellValue);
  
  // row = $('#serversStatus').filter(() => {
  //   return $.trim($('td', this).eq(0).text()) == (address + "<br/>" + serverStatus.motd.html);
  // });


  console.log(row)
  if (row) {
    console.log("cells:", row.cells[0])
    // icon
    row.insertCell().innerHTML = iconCellValue;
    // address
    row.insertCell().innerHTML = addressCellValue;
    // players online
    row.insertCell().innerHTML = playersOnlineCellValue;
  }
  else {
    // GET TABLE
    let table = document.getElementById("serversStatus");
  
    // INSERT ROW
    row = table.insertRow();
  
    // INSERT CELLS
    // icon
    let cell = row.insertCell();
    cell.innerHTML = iconCellValue;
    // address
    cell = row.insertCell();
    cell.innerHTML = addressCellValue;
    // players online
    cell = row.insertCell();
    cell.innerHTML = playersOnlineCellValue;
  }
}

const loadServersStatus = () => {
  let servers = [
    "worldswithoutend.us.to"
  ]

  servers.sort((a,b)=>a>b)

  for (let server of servers) {
    refreshServerTableRow(server);
  }
}
