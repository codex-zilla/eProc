// Tanzania Administrative Locations with approximate coordinates
// Data structure: Region -> Districts -> Wards (sample data)

export interface Ward {
  name: string;
  lat: number;
  lng: number;
}

export interface District {
  name: string;
  lat: number;
  lng: number;
  wards: Ward[];
}

export interface Region {
  name: string;
  lat: number;
  lng: number;
  districts: District[];
}

export const tanzaniaLocations: Region[] = [
  {
    name: 'Dar es Salaam',
    lat: -6.7924,
    lng: 39.2083,
    districts: [
      {
        name: 'Kinondoni',
        lat: -6.7694,
        lng: 39.2292,
        wards: [
          { name: 'Msasani', lat: -6.7501, lng: 39.2673 },
          { name: 'Kawe', lat: -6.7167, lng: 39.2333 },
          { name: 'Mikocheni', lat: -6.7667, lng: 39.2500 },
          { name: 'Kijitonyama', lat: -6.7833, lng: 39.2500 },
          { name: 'Sinza', lat: -6.7833, lng: 39.2333 },
        ]
      },
      {
        name: 'Ilala',
        lat: -6.8167,
        lng: 39.2833,
        wards: [
          { name: 'Kariakoo', lat: -6.8167, lng: 39.2833 },
          { name: 'Kivukoni', lat: -6.8167, lng: 39.2917 },
          { name: 'Upanga', lat: -6.8000, lng: 39.2833 },
          { name: 'Ilala', lat: -6.8333, lng: 39.2667 },
          { name: 'Buguruni', lat: -6.8333, lng: 39.2500 },
        ]
      },
      {
        name: 'Temeke',
        lat: -6.8667,
        lng: 39.2500,
        wards: [
          { name: 'Temeke', lat: -6.8667, lng: 39.2333 },
          { name: 'Mbagala', lat: -6.8833, lng: 39.2333 },
          { name: 'Chamazi', lat: -6.9167, lng: 39.2167 },
          { name: 'Kurasini', lat: -6.8500, lng: 39.2833 },
        ]
      },
      {
        name: 'Ubungo',
        lat: -6.7833,
        lng: 39.2000,
        wards: [
          { name: 'Ubungo', lat: -6.7833, lng: 39.2000 },
          { name: 'Manzese', lat: -6.8000, lng: 39.2167 },
          { name: 'Kimara', lat: -6.7833, lng: 39.1833 },
          { name: 'Saranga', lat: -6.7667, lng: 39.1833 },
        ]
      },
      {
        name: 'Kigamboni',
        lat: -6.8667,
        lng: 39.3167,
        wards: [
          { name: 'Kigamboni', lat: -6.8667, lng: 39.3167 },
          { name: 'Vijibweni', lat: -6.8500, lng: 39.3333 },
          { name: 'Kibada', lat: -6.9000, lng: 39.3333 },
        ]
      }
    ]
  },
  {
    name: 'Arusha',
    lat: -3.3869,
    lng: 36.6830,
    districts: [
      {
        name: 'Arusha City',
        lat: -3.3869,
        lng: 36.6830,
        wards: [
          { name: 'Sekei', lat: -3.3700, lng: 36.6900 },
          { name: 'Kaloleni', lat: -3.3800, lng: 36.6800 },
          { name: 'Daraja Mbili', lat: -3.3900, lng: 36.6750 },
        ]
      },
      {
        name: 'Arusha District',
        lat: -3.4000,
        lng: 36.7000,
        wards: [
          { name: 'Usa River', lat: -3.3667, lng: 36.8500 },
          { name: 'Tengeru', lat: -3.3833, lng: 36.8000 },
        ]
      }
    ]
  },
  {
    name: 'Dodoma',
    lat: -6.1630,
    lng: 35.7516,
    districts: [
      {
        name: 'Dodoma City',
        lat: -6.1630,
        lng: 35.7516,
        wards: [
          { name: 'Makole', lat: -6.1500, lng: 35.7500 },
          { name: 'Chamwino', lat: -6.1700, lng: 35.7600 },
          { name: 'Kikuyu', lat: -6.1800, lng: 35.7400 },
        ]
      }
    ]
  },
  {
    name: 'Mwanza',
    lat: -2.5167,
    lng: 32.9000,
    districts: [
      {
        name: 'Nyamagana',
        lat: -2.5167,
        lng: 32.9000,
        wards: [
          { name: 'Pamba', lat: -2.5100, lng: 32.9100 },
          { name: 'Mirongo', lat: -2.5200, lng: 32.8900 },
        ]
      },
      {
        name: 'Ilemela',
        lat: -2.5000,
        lng: 32.8833,
        wards: [
          { name: 'Buswelu', lat: -2.4900, lng: 32.8700 },
          { name: 'Pasiansi', lat: -2.5100, lng: 32.8600 },
        ]
      }
    ]
  },
  {
    name: 'Mbeya',
    lat: -8.9000,
    lng: 33.4500,
    districts: [
      {
        name: 'Mbeya City',
        lat: -8.9000,
        lng: 33.4500,
        wards: [
          { name: 'Iyunga', lat: -8.8900, lng: 33.4400 },
          { name: 'Sisimba', lat: -8.9100, lng: 33.4600 },
        ]
      }
    ]
  }
];

// Helper functions
export const getRegions = () => tanzaniaLocations.map(r => ({ name: r.name, lat: r.lat, lng: r.lng }));

export const getDistricts = (regionName: string) => {
  const region = tanzaniaLocations.find(r => r.name === regionName);
  return region ? region.districts.map(d => ({ name: d.name, lat: d.lat, lng: d.lng })) : [];
};

export const getWards = (regionName: string, districtName: string) => {
  const region = tanzaniaLocations.find(r => r.name === regionName);
  if (!region) return [];
  const district = region.districts.find(d => d.name === districtName);
  return district ? district.wards : [];
};
