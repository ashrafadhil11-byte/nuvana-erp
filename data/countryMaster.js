/**
 * countryMaster.js
 * Master data for countries, phone codes, and states/provinces.
 * Used by the International Booking module.
 */

const COUNTRY_MASTER = [
  {
    code: 'OM', name: 'Oman', phoneCode: '+968',
    states: ['Muscat', 'Dhofar', 'Musandam', 'Al Buraymi', 'Al Dakhiliyah', 'Al Batinah North', 'Al Batinah South', 'Al Sharqiyah North', 'Al Sharqiyah South', 'Al Dhahirah', 'Al Wusta']
  },
  {
    code: 'IN', name: 'India', phoneCode: '+91',
    states: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry']
  },
  {
    code: 'US', name: 'United States', phoneCode: '+1',
    states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
  },
  {
    code: 'GB', name: 'United Kingdom', phoneCode: '+44',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    code: 'AE', name: 'United Arab Emirates', phoneCode: '+971',
    states: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
  },
  {
    code: 'SA', name: 'Saudi Arabia', phoneCode: '+966',
    states: ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Tabuk', 'Hail', 'Northern Borders', 'Jizan', 'Najran', 'Al Bahah', 'Al Jawf', 'Qassim']
  },
  {
    code: 'KW', name: 'Kuwait', phoneCode: '+965',
    states: ['Al Asimah', 'Hawalli', 'Farwaniyah', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra']
  },
  {
    code: 'QA', name: 'Qatar', phoneCode: '+974',
    states: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Shamal', 'Al Daayen', 'Al Shahaniya']
  },
  {
    code: 'BH', name: 'Bahrain', phoneCode: '+973',
    states: ['Capital', 'Muharraq', 'Northern', 'Southern']
  },
  {
    code: 'CA', name: 'Canada', phoneCode: '+1',
    states: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon']
  },
  {
    code: 'AU', name: 'Australia', phoneCode: '+61',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory']
  },
  {
    code: 'DE', name: 'Germany', phoneCode: '+49',
    states: ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia']
  },
  {
    code: 'FR', name: 'France', phoneCode: '+33',
    states: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', "Provence-Alpes-Côte d'Azur"]
  },
  {
    code: 'IT', name: 'Italy', phoneCode: '+39',
    states: ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Puglia', 'Sardinia', 'Sicily', 'Tuscany', 'Trentino-South Tyrol', 'Umbria', "Aosta Valley", 'Veneto']
  },
  {
    code: 'ES', name: 'Spain', phoneCode: '+34',
    states: ['Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria', 'Castilla-La Mancha', 'Castile and León', 'Catalonia', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarre', 'Valencia']
  },
  {
    code: 'PK', name: 'Pakistan', phoneCode: '+92',
    states: ['Balochistan', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh', 'Azad Kashmir', 'Gilgit-Baltistan', 'Islamabad Capital Territory']
  },
  {
    code: 'BD', name: 'Bangladesh', phoneCode: '+880',
    states: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh']
  },
  {
    code: 'LK', name: 'Sri Lanka', phoneCode: '+94',
    states: ['Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western']
  },
  {
    code: 'NP', name: 'Nepal', phoneCode: '+977',
    states: ['Province No. 1', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
  },
  {
    code: 'MY', name: 'Malaysia', phoneCode: '+60',
    states: ['Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu']
  },
  {
    code: 'SG', name: 'Singapore', phoneCode: '+65',
    states: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region']
  },
  {
    code: 'PH', name: 'Philippines', phoneCode: '+63',
    states: ['NCR', 'CAR', 'Ilocos Region', 'Cagayan Valley', 'Central Luzon', 'CALABARZON', 'MIMAROPA', 'Bicol Region', 'Western Visayas', 'Central Visayas', 'Eastern Visayas', 'Zamboanga Peninsula', 'Northern Mindanao', 'Davao Region', 'SOCCSKSARGEN', 'CARAGA', 'BARMM']
  },
  {
    code: 'ID', name: 'Indonesia', phoneCode: '+62',
    states: ['Aceh', 'Bali', 'Bangka Belitung', 'Banten', 'Bengkulu', 'Central Java', 'Central Kalimantan', 'Central Sulawesi', 'East Java', 'East Kalimantan', 'East Nusa Tenggara', 'Gorontalo', 'Jakarta', 'Jambi', 'Lampung', 'Maluku', 'North Kalimantan', 'North Maluku', 'North Sulawesi', 'North Sumatra', 'Papua', 'Riau', 'Riau Islands', 'Southeast Sulawesi', 'South Kalimantan', 'South Sulawesi', 'South Sumatra', 'West Java', 'West Kalimantan', 'West Nusa Tenggara', 'West Papua', 'West Sulawesi', 'West Sumatra', 'Yogyakarta']
  },
  {
    code: 'TH', name: 'Thailand', phoneCode: '+66',
    states: ['Bangkok', 'Chiang Mai', 'Chiang Rai', 'Nonthaburi', 'Pathum Thani', 'Samut Prakan', 'Nakhon Ratchasima', 'Khon Kaen', 'Udon Thani', 'Chon Buri', 'Rayong', 'Phuket', 'Surat Thani', 'Songkhla', 'Hat Yai']
  },
  {
    code: 'CN', name: 'China', phoneCode: '+86',
    states: ['Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang']
  },
  {
    code: 'JP', name: 'Japan', phoneCode: '+81',
    states: ['Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki', 'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori', 'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi']
  },
  {
    code: 'KR', name: 'South Korea', phoneCode: '+82',
    states: ['Seoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon', 'North Chungcheong', 'South Chungcheong', 'North Jeolla', 'South Jeolla', 'North Gyeongsang', 'South Gyeongsang', 'Jeju']
  },
  {
    code: 'NZ', name: 'New Zealand', phoneCode: '+64',
    states: ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', "Hawke's Bay", 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast']
  },
  {
    code: 'ZA', name: 'South Africa', phoneCode: '+27',
    states: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape']
  },
  {
    code: 'NG', name: 'Nigeria', phoneCode: '+234',
    states: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']
  },
  {
    code: 'GH', name: 'Ghana', phoneCode: '+233',
    states: ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North']
  },
  {
    code: 'KE', name: 'Kenya', phoneCode: '+254',
    states: ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot']
  },
  {
    code: 'EG', name: 'Egypt', phoneCode: '+20',
    states: ['Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez']
  },
  {
    code: 'BR', name: 'Brazil', phoneCode: '+55',
    states: ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins']
  },
  {
    code: 'MX', name: 'Mexico', phoneCode: '+52',
    states: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas']
  },
  {
    code: 'NL', name: 'Netherlands', phoneCode: '+31',
    states: ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland']
  },
  {
    code: 'CH', name: 'Switzerland', phoneCode: '+41',
    states: ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-City', 'Basel-Landschaft', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich']
  },
  {
    code: 'SE', name: 'Sweden', phoneCode: '+46',
    states: ['Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland']
  },
  {
    code: 'NO', name: 'Norway', phoneCode: '+47',
    states: ['Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken']
  },
  {
    code: 'DK', name: 'Denmark', phoneCode: '+45',
    states: ['Capital Region', 'Central Denmark', 'North Denmark', 'Region Zealand', 'Southern Denmark']
  },
  {
    code: 'FI', name: 'Finland', phoneCode: '+358',
    states: ['Åland Islands', 'Central Finland', 'Central Ostrobothnia', 'Kainuu', 'Kymenlaakso', 'Lapland', 'North Karelia', 'Northern Ostrobothnia', 'Northern Savonia', 'Ostrobothnia', 'Päijänne Tavastia', 'Pirkanmaa', 'Satakunta', 'South Karelia', 'South Ostrobothnia', 'South Savo', 'Southwest Finland', 'Tavastia Proper', 'Uusimaa']
  },
  {
    code: 'PL', name: 'Poland', phoneCode: '+48',
    states: ['Greater Poland', 'Kuyavian-Pomeranian', 'Lesser Poland', 'Lodz', 'Lower Silesian', 'Lublin', 'Lubusz', 'Masovian', 'Opole', 'Podkarpackie', 'Podlaskie', 'Pomeranian', 'Silesian', 'Swietokrzyskie', 'Warmian-Masurian', 'West Pomeranian']
  },
  {
    code: 'TR', name: 'Turkey', phoneCode: '+90',
    states: ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Gaziantep', 'Istanbul', 'Izmir', 'Kayseri', 'Konya', 'Mersin', 'Şanlıurfa']
  },
  {
    code: 'RU', name: 'Russia', phoneCode: '+7',
    states: ['Central Federal District', 'Far Eastern Federal District', 'North Caucasian Federal District', 'Northwestern Federal District', 'Siberian Federal District', 'Southern Federal District', 'Ural Federal District', 'Volga Federal District']
  },
  {
    code: 'IR', name: 'Iran', phoneCode: '+98',
    states: ['Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan', 'Esfahan', 'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Kerman', 'Kermanshah', 'Khuzestan', 'Kohgiluyeh and Boyer Ahmad', 'Kurdistan', 'Lorestan', 'Markazi', 'Mazandaran', 'North Khorasan', 'Qazvin', 'Qom', 'Razavi Khorasan', 'Semnan', 'Sistan and Baluchestan', 'South Khorasan', 'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan']
  },
  {
    code: 'IQ', name: 'Iraq', phoneCode: '+964',
    states: ['Anbar', 'Babylon', 'Baghdad', 'Basra', 'Dhi Qar', 'Diyala', 'Duhok', 'Erbil', 'Karbala', 'Kirkuk', 'Maysan', 'Muthanna', 'Najaf', 'Nineveh', 'Qadisiyyah', 'Saladin', 'Sulaymaniyah', 'Wasit']
  },
  {
    code: 'JO', name: 'Jordan', phoneCode: '+962',
    states: ['Ajloun', 'Amman', 'Aqaba', 'Balqa', 'Irbid', 'Jerash', 'Karak', 'Ma\'an', 'Madaba', 'Mafraq', 'Tafilah', 'Zarqa']
  },
  {
    code: 'LB', name: 'Lebanon', phoneCode: '+961',
    states: ['Akkar', 'Baalbek-Hermel', 'Beirut', 'Bekaa', 'Mount Lebanon', 'Nabatieh', 'North Lebanon', 'South Lebanon']
  },
  {
    code: 'YE', name: 'Yemen', phoneCode: '+967',
    states: ["Abyan", "Aden", "Al Bayda'", "Al Hudaydah", "Al Jawf", "Al Mahrah", "Al Mahwit", "Amanat Al Asimah", "Amran", "Dhamar", "Hadhramaut", "Hajjah", "Ibb", "Lahij", "Ma'rib", "Raymah", "Sa'dah", "Sana'a", "Shabwah", "Socotra", "Ta'izz"]
  },
  {
    code: 'ET', name: 'Ethiopia', phoneCode: '+251',
    states: ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South Ethiopia', 'South West Ethiopia', 'Tigray']
  },
  {
    code: 'TZ', name: 'Tanzania', phoneCode: '+255',
    states: ['Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Mjini Magharibi', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar North', 'Zanzibar South', 'Zanzibar West']
  },
  {
    code: 'PG', name: 'Papua New Guinea', phoneCode: '+675',
    states: ['Bougainville', 'Central', 'Chimbu', 'East New Britain', 'East Sepik', 'Eastern Highlands', 'Enga', 'Gulf', 'Hela', 'Jiwaka', 'Madang', 'Manus', 'Milne Bay', 'Morobe', 'National Capital District', 'New Ireland', 'Northern', 'Southern Highlands', 'West New Britain', 'West Sepik', 'Western', 'Western Highlands']
  },
  {
    code: 'VN', name: 'Vietnam', phoneCode: '+84',
    states: ['An Giang', 'Ba Ria - Vung Tau', 'Bac Giang', 'Bac Kan', 'Bac Lieu', 'Bac Ninh', 'Ben Tre', 'Binh Dinh', 'Binh Duong', 'Binh Phuoc', 'Binh Thuan', 'Ca Mau', 'Can Tho', 'Cao Bang', 'Da Nang', 'Dak Lak', 'Dak Nong', 'Dien Bien', 'Dong Nai', 'Dong Thap', 'Gia Lai', 'Ha Giang', 'Ha Nam', 'Ha Noi', 'Ha Tinh', 'Hai Duong', 'Hai Phong', 'Hau Giang', 'Ho Chi Minh City', 'Hoa Binh', 'Hung Yen', 'Khanh Hoa', 'Kien Giang', 'Kon Tum', 'Lai Chau', 'Lam Dong', 'Lang Son', 'Lao Cai', 'Long An', 'Nam Dinh', 'Nghe An', 'Ninh Binh', 'Ninh Thuan', 'Phu Tho', 'Phu Yen', 'Quang Binh', 'Quang Nam', 'Quang Ngai', 'Quang Ninh', 'Quang Tri', 'Soc Trang', 'Son La', 'Tay Ninh', 'Thai Binh', 'Thai Nguyen', 'Thanh Hoa', 'Thua Thien Hue', 'Tien Giang', 'Tra Vinh', 'Tuyen Quang', 'Vinh Long', 'Vinh Phuc', 'Yen Bai']
  }
];

// ─── ID Types for customs documentation ─────────────────────────────────────
const ID_TYPES = [
  'Passport',
  'National ID',
  'Driving License',
  'PAN Card',
  'AADHAR Card',
  'Voter ID',
  'Residence Permit',
  'Military ID',
  'Other'
];

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Returns all countries sorted alphabetically by name.
 */
function getAllCountries() {
  return [...COUNTRY_MASTER].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns the phone code for a given country code.
 * @param {string} countryCode - ISO 2-letter country code (e.g. 'IN')
 * @returns {string} Phone code (e.g. '+91') or empty string if not found
 */
function getPhoneCode(countryCode) {
  const country = COUNTRY_MASTER.find(c => c.code === countryCode);
  return country ? country.phoneCode : '';
}

/**
 * Returns states array for a given country code.
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {string[]} Array of state/province names, or empty array
 */
function getStates(countryCode) {
  const country = COUNTRY_MASTER.find(c => c.code === countryCode);
  return country ? [...country.states].sort() : [];
}

/**
 * Returns the full country object for a given code.
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {object|null} Country object or null
 */
function getCountryByCode(countryCode) {
  return COUNTRY_MASTER.find(c => c.code === countryCode) || null;
}

/**
 * Returns the country object matching a full country name.
 * @param {string} name - Full country name (e.g. 'India')
 * @returns {object|null}
 */
function getCountryByName(name) {
  return COUNTRY_MASTER.find(c => c.name === name) || null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COUNTRY_MASTER, ID_TYPES, getAllCountries, getPhoneCode, getStates, getCountryByCode, getCountryByName };
}