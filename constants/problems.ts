export const PROBLEMS = [
  // Home Repair & Maintenance
  { id: "p1", name: "Walls cracking / uneven floors", icon: "wall", slug: "wall-cracks", color: "#FF5722", workerTypes: ["w6", "w5"] },
  { id: "p2", name: "Roof leaks / weak foundations", icon: "home-roof", slug: "roof-leak", color: "#795548", workerTypes: ["w67", "w6", "w2"] },
  { id: "p3", name: "Power points not working", icon: "power-socket-uk", slug: "power-fault", color: "#FFC107", workerTypes: ["w3", "w5", "w100"] },
  { id: "p4", name: "Faulty wiring / short circuits", icon: "flash-alert", slug: "wiring-issue", color: "#F44336", workerTypes: ["w3", "w100"] },
  { id: "p5", name: "Blocked toilets / sinks", icon: "water-off", slug: "blocked-drain", color: "#2196F3", workerTypes: ["w2", "w101"] },
  { id: "p6", name: "Leaking taps & pipes", icon: "pipe-leak", slug: "leakage", color: "#03A9F4", workerTypes: ["w2", "w101"] },
  { id: "p8", name: "Broken doors / windows", icon: "door-open", slug: "broken-door", color: "#8D6E63", workerTypes: ["w4", "w5"] },
  { id: "p9", name: "Broken locks / keys", icon: "lock-open-variant", slug: "lock-repair", color: "#607D8B", workerTypes: ["w72", "w104"] },

  // Cleaning
  { id: "p10", name: "Houses deep cleaning", icon: "broom", slug: "deep-cleaning", color: "#00BCD4", workerTypes: ["w8", "w10"] },
  { id: "p13", name: "Office / Workspace cleaning", icon: "office-building", slug: "office-cleaning", color: "#546E7A", workerTypes: ["w11"] },
  { id: "p14", name: "Laundry & Ironing pile", icon: "iron", slug: "laundry-help", color: "#9C27B0", workerTypes: ["w12"] },

  // Appliance Repair
  { id: "p15", name: "Washing machine not spinning", icon: "washing-machine", slug: "washing-machine-repair", color: "#2196F3", workerTypes: ["w20"] },
  { id: "p16", name: "Fridge not cooling", icon: "fridge", slug: "fridge-repair", color: "#03A9F4", workerTypes: ["w21"] },
  { id: "p17", name: "AC not cooling / leaking", icon: "air-conditioner", slug: "ac-repair", color: "#00BCD4", workerTypes: ["w22"] },
  { id: "p18", name: "Water heater issues", icon: "water-boiler", slug: "water-heater-repair", color: "#FF5722", workerTypes: ["w23"] },
  { id: "p19", name: "Cooker / Oven not heating", icon: "stove", slug: "cooker-repair", color: "#FF9800", workerTypes: ["w24"] },

  // Tech & IT
  { id: "p11", name: "Internet / WiFi issues", icon: "wifi-strength-1", slug: "internet-fault", color: "#3F51B5", workerTypes: ["w29", "w32"] },
  { id: "p12", name: "CCTV / Security malfunction", icon: "cctv", slug: "security-fault", color: "#333333", workerTypes: ["w30", "w74"] },
  { id: "p20", name: "Laptop / Computer won\"t start", icon: "laptop", slug: "computer-repair", color: "#3F51B5", workerTypes: ["w26", "w27"] },
  { id: "p21", name: "Broken phone screen / battery", icon: "cellphone", slug: "phone-repair", color: "#9C27B0", workerTypes: ["w28"] },

  // Vehicle
  { id: "p22", name: "Car breakdown / Engine light", icon: "car-wrench", slug: "car-repair", color: "#607D8B", workerTypes: ["w61", "w63"] },
  { id: "p23", name: "Bike / Scooter repair", icon: "motorbike", slug: "bike-repair", color: "#FF5722", workerTypes: ["w62"] },
  { id: "p24", name: "Flat battery / Jumpstart", icon: "battery-status-60", slug: "battery-jumpstart", color: "#4CAF50", workerTypes: ["w103", "w64"] },
  { id: "p25", name: "Car needs a wash", icon: "car-wash", slug: "car-wash", color: "#03A9F4", workerTypes: ["w65"] },

  // Moving & Transport
  { id: "p26", name: "Moving house / Furniture", icon: "truck-delivery", slug: "house-moving", color: "#F44336", workerTypes: ["w14", "w16", "w19"] },
  { id: "p27", name: "Large item delivery", icon: "package-variant", slug: "goods-transport", color: "#FF5252", workerTypes: ["w15", "w17", "w18"] },

  // Personal Care
  { id: "p28", name: "Need a haircut / Grooming", icon: "content-cut", slug: "hair-cut", color: "#795548", workerTypes: ["w38", "w39"] },
  { id: "p29", name: "Makeup for event", icon: "brush", slug: "makeup-artist", color: "#FF4081", workerTypes: ["w40", "w41"] },

  // Pest & Garden
  { id: "p30", name: "Pest infestation (insects/rats)", icon: "bug", slug: "pest-control", color: "#D32F2F", workerTypes: ["w84"] },
  { id: "p31", name: "Overgrown garden / Tree removal", icon: "pine-tree", slug: "garden-maintenance", color: "#388E3C", workerTypes: ["w81", "w82", "w13"] },

  // Emergency (Specific)
  { id: "p32", name: "Gas leak / Stove smell", icon: "gas-cylinder", slug: "gas-issue", color: "#FF9800", workerTypes: ["w2", "w24"] },
  { id: "p33", name: "Locked out of house/car", icon: "key-alert", slug: "lockout", color: "#F44336", workerTypes: ["w72", "w104"] }
];

export type Problem = (typeof PROBLEMS)[0];
