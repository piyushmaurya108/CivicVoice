// India location data for the cascading address-search picker (Change 3).
// Each state has an approximate centroid + zoom level so the map can fly to it.
// District zoom + locality pin-drop are resolved at runtime via Nominatim
// forward geocoding (with a fallback to the state centroid), so districts only
// need names here. Full district lists are provided for the 10 priority states;
// major districts are listed for the rest.

export const COUNTRY = 'India';

export const STATES = [
  { name: 'Andhra Pradesh', lat: 15.9129, lng: 79.74, zoom: 7 },
  { name: 'Arunachal Pradesh', lat: 28.218, lng: 94.7278, zoom: 7 },
  { name: 'Assam', lat: 26.2006, lng: 92.9376, zoom: 7 },
  { name: 'Bihar', lat: 25.0961, lng: 85.3131, zoom: 7 },
  { name: 'Chhattisgarh', lat: 21.2787, lng: 81.8661, zoom: 7 },
  { name: 'Goa', lat: 15.2993, lng: 74.124, zoom: 9 },
  { name: 'Gujarat', lat: 22.2587, lng: 71.1924, zoom: 7 },
  { name: 'Haryana', lat: 29.0588, lng: 76.0856, zoom: 8 },
  { name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, zoom: 8 },
  { name: 'Jharkhand', lat: 23.6102, lng: 85.2799, zoom: 7 },
  { name: 'Karnataka', lat: 15.3173, lng: 75.7139, zoom: 7 },
  { name: 'Kerala', lat: 10.8505, lng: 76.2711, zoom: 7 },
  { name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, zoom: 6 },
  { name: 'Maharashtra', lat: 19.7515, lng: 75.7139, zoom: 6 },
  { name: 'Manipur', lat: 24.6637, lng: 93.9063, zoom: 8 },
  { name: 'Meghalaya', lat: 25.467, lng: 91.3662, zoom: 8 },
  { name: 'Mizoram', lat: 23.1645, lng: 92.9376, zoom: 8 },
  { name: 'Nagaland', lat: 26.1584, lng: 94.5624, zoom: 8 },
  { name: 'Odisha', lat: 20.9517, lng: 85.0985, zoom: 7 },
  { name: 'Punjab', lat: 31.1471, lng: 75.3412, zoom: 8 },
  { name: 'Rajasthan', lat: 27.0238, lng: 74.2179, zoom: 6 },
  { name: 'Sikkim', lat: 27.533, lng: 88.5122, zoom: 9 },
  { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, zoom: 7 },
  { name: 'Telangana', lat: 18.1124, lng: 79.0193, zoom: 7 },
  { name: 'Tripura', lat: 23.9408, lng: 91.9882, zoom: 9 },
  { name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, zoom: 6 },
  { name: 'Uttarakhand', lat: 30.0668, lng: 79.0193, zoom: 7 },
  { name: 'West Bengal', lat: 22.9868, lng: 87.855, zoom: 7 },
  // Union Territories
  { name: 'Andaman and Nicobar Islands', lat: 11.7401, lng: 92.6586, zoom: 7 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, zoom: 11 },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.1809, lng: 73.0169, zoom: 9 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025, zoom: 10 },
  { name: 'Jammu and Kashmir', lat: 33.7782, lng: 76.5762, zoom: 7 },
  { name: 'Ladakh', lat: 34.2268, lng: 77.5619, zoom: 7 },
  { name: 'Lakshadweep', lat: 10.5667, lng: 72.6417, zoom: 9 },
  { name: 'Puducherry', lat: 11.9416, lng: 79.8083, zoom: 10 }
];

// Full district lists for the 10 priority states; major districts for the rest.
export const DISTRICTS = {
  Punjab: [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka',
    'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
    'Malerkotla', 'Mansa', 'Moga', 'Mohali (SAS Nagar)', 'Muktsar (Sri Muktsar Sahib)',
    'Pathankot', 'Patiala', 'Rupnagar (Ropar)', 'Sangrur', 'Shaheed Bhagat Singh Nagar (Nawanshahr)',
    'Tarn Taran'
  ],
  Delhi: [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi',
    'West Delhi'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya',
    'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
    'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli',
    'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
    'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur',
    'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat',
    'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri (Lakhimpur)', 'Kushinagar', 'Lalitpur',
    'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur',
    'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli',
    'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli',
    'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ],
  Haryana: [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar',
    'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal',
    'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  Maharashtra: [
    'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur',
    'Chhatrapati Sambhajinagar (Aurangabad)', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
    'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
    'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)', 'Palghar', 'Parbhani', 'Pune',
    'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
    'Washim', 'Yavatmal'
  ],
  Karnataka: [
    'Bagalkot', 'Ballari (Bellary)', 'Belagavi (Belgaum)', 'Bengaluru Rural',
    'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru',
    'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
    'Kalaburagi (Gulbarga)', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru (Mysore)',
    'Raichur', 'Ramanagara', 'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)', 'Udupi',
    'Uttara Kannada', 'Vijayanagara', 'Vijayapura (Bijapur)', 'Yadgir'
  ],
  Rajasthan: [
    'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner',
    'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur',
    'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur',
    'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar',
    'Tonk', 'Udaipur'
  ],
  Bihar: [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
    'Darbhanga', 'East Champaran (Motihari)', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad',
    'Kaimur (Bhabua)', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura',
    'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas',
    'Saharsa', 'Samastipur', 'Saran (Chapra)', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
    'Supaul', 'Vaishali', 'West Champaran (Bettiah)'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul',
    'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
    'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad (Narmadapuram)', 'Indore',
    'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
    'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa',
    'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri',
    'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ],
  Gujarat: [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
    'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath',
    'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada',
    'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat',
    'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ],
  // Major districts for the remaining states/UTs
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Anantapur', 'Kakinada', 'Tirupati', 'Rajahmundry', 'Chittoor'],
  'Arunachal Pradesh': ['Papum Pare (Itanagar)', 'Tawang', 'West Kameng', 'East Siang', 'Lohit', 'Changlang'],
  Assam: ['Kamrup Metropolitan (Guwahati)', 'Dibrugarh', 'Cachar (Silchar)', 'Nagaon', 'Jorhat', 'Tinsukia', 'Barpeta', 'Sonitpur'],
  Chhattisgarh: ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Raigarh', 'Bastar (Jagdalpur)', 'Rajnandgaon', 'Surguja (Ambikapur)'],
  Goa: ['North Goa', 'South Goa'],
  'Himachal Pradesh': ['Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Una', 'Hamirpur', 'Bilaspur', 'Kullu'],
  Jharkhand: ['Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Palamu'],
  Kerala: ['Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Palakkad', 'Malappuram', 'Kottayam', 'Alappuzha'],
  Manipur: ['Imphal West', 'Imphal East', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  Meghalaya: ['East Khasi Hills (Shillong)', 'West Garo Hills', 'Ri Bhoi', 'Jaintia Hills'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  Odisha: ['Khordha (Bhubaneswar)', 'Cuttack', 'Ganjam (Berhampur)', 'Sundargarh (Rourkela)', 'Sambalpur', 'Puri', 'Balasore', 'Mayurbhanj'],
  Sikkim: ['Gangtok (East Sikkim)', 'West Sikkim', 'South Sikkim', 'North Sikkim'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Tiruppur'],
  Telangana: ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Karimnagar', 'Khammam', 'Nizamabad', 'Nalgonda'],
  Tripura: ['West Tripura (Agartala)', 'Gomati', 'North Tripura', 'South Tripura'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar', 'Pauri Garhwal', 'Almora', 'Tehri Garhwal'],
  'West Bengal': ['Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas', 'Hooghly', 'Bardhaman', 'Darjeeling', 'Nadia', 'Murshidabad', 'Siliguri (Jalpaiguri)'],
  'Andaman and Nicobar Islands': ['South Andaman (Port Blair)', 'North and Middle Andaman', 'Nicobar'],
  Chandigarh: ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli (Silvassa)', 'Daman', 'Diu'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Pulwama', 'Budgam'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Lakshadweep'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
};

export const STATE_NAMES = STATES.map((s) => s.name);

export function getStateMeta(name) {
  return STATES.find((s) => s.name === name) || null;
}

export function getDistricts(stateName) {
  return DISTRICTS[stateName] || [];
}
