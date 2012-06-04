var wireless = require('wireless');
var fs = require('fs');
var _ = require('underscore');

wireless.configure({
    commands: {
        scan: 'sudo iwlist :INTERFACE scan',
        stat: 'sudo ifconfig :INTERFACE',
        disable: 'sudo ifconfig :INTERFACE down',
        enable: 'sudo ifconfig :INTERFACE up',
        interfaces: 'iwconfig',
        metric: 'sudo ifconfig :INTERFACE metric :VALUE',
        dhcp: 'sudo dhcpcd :INTERFACE',
    },
    iface: 'wlan0',
    updateFrequency: 8,
    disappearThreshold: 7,
});

console.log("Enabling wireless card...");
wireless.enable(function() {
    console.log("Wireless card enabled.");
    console.log("Starting wireless scan...");

    wireless.start(function() {
        console.log("Wireless scanning has commenced.");
    });
});

wireless.on('appear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network appeared");
        throw error;
    }
    var strength = Math.floor(network.quality / 70 * 100);
    var encryption_type = 'NONE';
    if (network.encryption_wep) {
        encryption_type = 'WEP';
    } else if (network.encryption_wpa && network.encryption_wpa2) {
        encryption_type = 'WPA&WPA2';
    } else if (network.encryption_wpa) {
        encryption_type = 'WPA';
    } else if (network.encryption_wpa2) {
        encryption_type = 'WPA2';
    }
    console.log("[  APPEAR] " + network.ssid + " [" + network.address + "] " + strength + "% " + network.strength + " dBm " + encryption_type);
});

wireless.on('disappear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network disappeared");
        throw error;
    }
    console.log("[    HIDE] " + network.ssid + " [" + network.address + "] ");
});

wireless.on('change', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network changed");
        throw error;
    }
    console.log("[  CHANGE] " + network.ssid);
});

wireless.on('connect', function(error, network) {
    console.log("[ CONNECT] " + network.ssid);
});

wireless.on('disconnect', function(error, network) {
    console.log("[   DISCO] " + network.ssid);
    console.log("Don't be sad. There are still " + wireless.networks.length + " fish in the sea.");
});


process.on('SIGINT', function() {
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");

    console.log("Disabling Adapter...");
    wireless.disable(function() {

        console.log("Stopping Wireless App...");
        wireless.stop(function() {

            console.log("Exiting...");
            process.exit();
        });
    });
});
