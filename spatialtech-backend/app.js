/* ============================================================
   cPanel / Phusion Passenger Entry Point
   ============================================================ */

// Load the main server logic
// cPanel's Node.js Selector defaults to looking for 'app.js'
require('./server.js');
