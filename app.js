

var shadowsocks = "__PROXY__"
var direct = "DIRECT"

function isPrivate(ip) {
  return (
    isInNetEx(ip, "10.0.0.0/8") ||
    isInNetEx(ip, "100.64.0.0/10") ||
    isInNetEx(ip, "172.16.0.0/12") ||
    isInNetEx(ip, "192.0.0.0/24") ||
    isInNetEx(ip, "192.168.0.0/16") ||
    isInNetEx(ip, "198.18.0.0/15") ||
    isInNetEx(ip, "fc00::/7")
  )
}

function FindProxyForURL(url, host) {

  // If user requests plain hostnames, e.g. http://intranet/, http://webserver-name01/, send direct.
  if (isPlainHostName(host)) {
    return direct;
  }

  // china
  for (var i in blocks) {
    var target = dnsResolve(host)
    if (isPrivate(target) || isInNetEx(target, blocks[i])) {
      return direct;
    }
  }

  return shadowsocks;
}