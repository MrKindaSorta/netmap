// IP/CIDR Helper Functions
export const ipToNumber = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
};

export const checkIpInSubnet = (ip, cidr) => {
  const [subnet, mask] = cidr.split('/');
  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);
  const maskBits = parseInt(mask);
  const maskNum = -1 << (32 - maskBits);
  return (ipNum & maskNum) === (subnetNum & maskNum);
};

// Validation Functions
export const validateVlanId = (id, existingVlans, currentId = null) => {
  const numId = parseInt(id);
  if (isNaN(numId)) return "VLAN ID must be a number";
  if (numId < 1 || numId > 4094) return "VLAN ID must be between 1 and 4094";
  if (numId !== currentId && existingVlans[numId]) return `VLAN ${numId} already exists`;
  return null;
};

export const validateSubnet = (subnet) => {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  if (!subnet?.trim()) return "Subnet is required";
  if (!cidrRegex.test(subnet)) return "Invalid CIDR notation (e.g., 10.0.10.0/24)";

  const [ip, mask] = subnet.split('/');
  const octets = ip.split('.').map(Number);
  const maskNum = parseInt(mask);

  if (octets.some(o => o < 0 || o > 255)) return "IP octets must be between 0 and 255";
  if (maskNum < 0 || maskNum > 32) return "Subnet mask must be between 0 and 32";
  return null;
};

export const validateGateway = (gateway, subnet) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!gateway?.trim()) return "Gateway is required";
  if (!ipRegex.test(gateway)) return "Invalid IP address format";

  const octets = gateway.split('.').map(Number);
  if (octets.some(o => o < 0 || o > 255)) return "IP octets must be between 0 and 255";

  if (subnet && !validateSubnet(subnet)) {
    if (!checkIpInSubnet(gateway, subnet)) {
      return `Gateway must be within subnet ${subnet}`;
    }
  }
  return null;
};

export const validateVlanForm = (vlanData, existingVlans, currentId = null) => {
  const errors = {};

  const idError = validateVlanId(vlanData.id, existingVlans, currentId);
  if (idError) errors.id = idError;

  if (!vlanData.name?.trim()) errors.name = "VLAN name is required";

  const subnetError = validateSubnet(vlanData.subnet);
  if (subnetError) errors.subnet = subnetError;

  const gatewayError = validateGateway(vlanData.gateway, vlanData.subnet);
  if (gatewayError) errors.gateway = gatewayError;

  if (!vlanData.color?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    errors.color = "Invalid hex color";
  }

  return errors;
};
