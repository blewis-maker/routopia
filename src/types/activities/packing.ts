export interface PackingList {
  // Core packing categories
  essentials: {
    documents: string[];        // ['license', 'insurance', 'permits']
    safety: string[];          // ['first-aid', 'emergency-contacts']
    navigation: string[];      // ['phone', 'maps', 'compass']
  };

  // Vehicle & Travel
  vehicle: {
    required: string[];        // ['chains', 'spare-tire', 'jack']
    recommended: string[];     // ['jumper-cables', 'flashlight']
    emergency: string[];       // ['blanket', 'water', 'snacks']
  };

  // Activity specific gear
  activityGear: {
    ski: {
      equipment: string[];     // ['skis', 'poles', 'boots']
      clothing: string[];      // ['ski-jacket', 'goggles']
      safety: string[];       // ['avalanche-beacon', 'probe']
    };
    bike: {
      equipment: string[];    // ['bike', 'helmet', 'repair-kit']
      clothing: string[];     // ['cycling-shorts', 'gloves']
      safety: string[];      // ['lights', 'reflectors']
      maintenance: string[]; // ['pump', 'spare-tube', 'multi-tool']
    };
    hike: {
      equipment: string[];    // ['backpack', 'trekking-poles']
      clothing: string[];     // ['hiking-boots', 'rain-jacket']
      safety: string[];      // ['whistle', 'headlamp']
      navigation: string[];  // ['compass', 'map', 'gps']
    };
    climb: {
      equipment: string[];   // ['rope', 'harness', 'carabiners']
      clothing: string[];    // ['climbing-shoes', 'chalk-bag']
      safety: string[];     // ['helmet', 'crash-pad']
      technical: string[]; // ['quickdraws', 'belay-device']
    };
    camp: {
      shelter: string[];    // ['tent', 'tarp', 'stakes']
      sleeping: string[];   // ['sleeping-bag', 'pad', 'pillow']
      cooking: string[];    // ['stove', 'fuel', 'cookware']
      tools: string[];     // ['knife', 'axe', 'saw']
    };
  };

  // Trip duration specific
  tripDuration: {
    dayTrip: string[];       // ['sunscreen', 'lunch', 'water']
    overnight: string[];     // ['sleeping-bag', 'tent', 'toiletries']
    multiDay: string[];      // ['laundry-supplies', 'cooking-gear']
  };

  // Group specific
  groupNeeds?: {
    shared: string[];        // ['group-shelter', 'first-aid-kit']
    individual: string[];    // ['sleeping-bag', 'headlamp']
    communal: string[];      // ['cooking-stove', 'water-filter']
  };

  // Weather dependent
  weatherSpecific: {
    cold: string[];         // ['hand-warmers', 'thermals']
    hot: string[];         // ['sun-hat', 'electrolytes']
    rain: string[];        // ['rain-shell', 'waterproof-bags']
    snow: string[];        // ['goggles', 'hand-warmers']
  };

  // Comfort & Convenience
  comfort: {
    rest: string[];        // ['camp-chair', 'pillow']
    food: string[];       // ['cooler', 'snacks']
    hygiene: string[];    // ['wipes', 'hand-sanitizer']
    entertainment: string[]; // ['book', 'cards']
  };
} 