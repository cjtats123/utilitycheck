// Shared geography for the water-district map.
// The water-rates dataset has province + name but NO coordinates, so:
//   1. CITY  = exact (city hall / poblacion) coordinates for cities listed below   -> exact pin
//   2. COORDS (scripts/water-coords.json, produced by geocode-water.mjs)           -> exact pin
//   3. PROV  = province center; districts without an exact pin are fanned out
//      around it in a small spiral so every one stays clickable                    -> approximate pin
// Keys are the province strings used by the dataset (before display clean-up).

export const PROV = {
  "Abra":[17.58,120.75],"Agusan Del Norte":[8.95,125.53],"Agusan Del Sur":[8.5,125.97],"Aklan":[11.67,122.37],
  "Albay":[13.18,123.6],"Antique":[11.15,122.05],"Aurora":[15.9,121.6],"Basilan":[6.55,122.05],"Bataan":[14.68,120.45],
  "Batangas":[13.85,121.05],"Benguet":[16.55,120.75],"Biliran":[11.58,124.47],"Bohol":[9.85,124.15],"Bukidnon":[8.05,125.1],
  "Bulacan":[14.85,120.9],"Cagayan":[17.65,121.75],"Camarines Norte":[14.15,122.7],"Camarines Sur":[13.6,123.35],
  "Camiguin":[9.17,124.72],"Capiz":[11.5,122.65],"Catanduanes":[13.8,124.3],"Cavite":[14.25,120.88],"Cebu":[10.3,123.85],
  "Compostela Valley":[7.55,126.1],"Davao (Del Norte)":[7.5,125.75],"Davao Del Sur":[6.75,125.35],"Davao Oriental":[7.0,126.3],
  "Dinagat Islands":[10.1,125.6],"Eastern Samar":[11.5,125.4],"Guimaras":[10.6,122.6],"Ifugao":[16.8,121.15],
  "Ilocos Norte":[18.15,120.8],"Ilocos Sur":[17.3,120.5],"Iloilo":[10.95,122.55],"Isabela":[16.95,121.85],"La Union":[16.6,120.4],
  "Laguna":[14.2,121.3],"Lanao Del Norte":[8.0,123.95],"Lanao Del Sur":[7.85,124.25],"Leyte":[10.85,124.9],"Maguindanao":[7.0,124.4],
  "Masbate":[12.25,123.6],"Misamis Occidental":[8.4,123.7],"Misamis Oriental":[8.5,124.7],"Negros Occidental":[10.4,123.0],
  "Negros Oriental":[9.6,123.1],"North Cotabato":[7.15,124.85],"Northern Samar":[12.4,124.6],"Nueva Ecija":[15.55,121.0],
  "Nueva Vizcaya":[16.3,121.15],"Occidental Mindoro":[13.1,120.8],"Oriental Mindoro":[12.9,121.25],"Palawan":[9.9,118.8],
  "Pampanga":[15.05,120.65],"Pangasinan":[15.95,120.35],"Quezon":[14.0,122.0],"Quirino":[16.5,121.55],"Rizal":[14.6,121.3],
  "Romblon":[12.55,122.3],"Sarangani":[5.95,125.2],"Siquijor":[9.2,123.58],"Sorsogon":[12.95,124.0],"South Cotabato":[6.3,124.85],
  "Southern Leyte":[10.3,125.0],"Sultan Kudarat":[6.55,124.4],"Sulu":[6.0,121.0],"Surigao Del Norte":[9.7,125.6],
  "Surigao Del Sur":[8.75,126.2],"Tarlac":[15.5,120.55],"Tawi Tawi":[5.1,119.9],"Western Samar":[11.75,125.0],"Zambales":[15.3,119.95],
  "Zamboanga Del Norte":[8.4,122.9],"Zamboanga Del Sur":[7.8,123.3],"Zamboanga Sibugay":[7.7,122.6]
};

// Dataset region code -> island group (L/V/M)
export const ISLAND = {"01":"L","02":"L","03":"L","04A":"L","04B":"L","05":"L","CAR":"L","06":"V","07":"V","08":"V",
  "09":"M","10":"M","11":"M","12":"M","BARMM":"M","CARAGA":"M"};

// Display names (dataset spelling -> what people actually say)
export const PROV_DISPLAY = {"Davao (Del Norte)":"Davao del Norte","Compostela Valley":"Davao de Oro","Western Samar":"Samar",
  "North Cotabato":"Cotabato","Tawi Tawi":"Tawi-Tawi"};
export const prettyProv = p => PROV_DISPLAY[p] || p.replace(/ Del /g, " del ");

// Exact coordinates for cities whose name in the dataset is unambiguous: "name|province"
export const CITY = {
  "Candon City|Ilocos Sur":[17.1953,120.4514],"Alaminos City|Pangasinan":[16.1556,119.9811],"Dagupan City|Pangasinan":[16.0433,120.3333],
  "San Carlos City|Pangasinan":[15.9283,120.3489],"Urdaneta City|Pangasinan":[15.9758,120.5711],"Cauayan City|Isabela":[16.9285,121.7734],
  "City of Ilagan|Isabela":[17.1488,121.8893],"Santiago City|Isabela":[16.6878,121.5489],"City of Malolos|Bulacan":[14.8433,120.8114],
  "Meycauayan City|Bulacan":[14.7367,120.9606],"San Jose del Monte City|Bulacan":[14.8139,121.0453],"Cabanatuan City|Nueva Ecija":[15.4868,120.9674],
  "Gapan City|Nueva Ecija":[15.3074,120.9461],"Munoz City|Nueva Ecija":[15.7167,120.9],"Palayan City|Nueva Ecija":[15.5431,121.0869],
  "San Jose City|Nueva Ecija":[15.7874,120.9906],"Angeles City|Pampanga":[15.145,120.5887],"City of San Fernando|Pampanga":[15.0286,120.6898],
  "Mabalacat City|Pampanga":[15.2167,120.5719],"Tarlac City|Tarlac":[15.4755,120.5963],"Batangas City|Batangas":[13.7565,121.0583],
  "Dasmarinas City|Cavite":[14.3294,120.9367],"Tagaytay City|Cavite":[14.1153,120.9621],"Trece Martires City|Cavite":[14.2823,120.8669],
  "San Pablo City|Laguna":[14.0683,121.3251],"Puerto Princesa City|Palawan":[9.7392,118.7353],"Legazpi City|Albay":[13.1391,123.7438],
  "Ligao City|Albay":[13.2397,123.5319],"Iriga City|Camarines Sur":[13.4192,123.4117],"Sorsogon City|Sorsogon":[12.9742,124.0058],
  "Bacolod City|Negros Occidental":[10.6765,122.9509],"Bago City|Negros Occidental":[10.5333,122.8333],"Cadiz City|Negros Occidental":[10.9575,123.3042],
  "Kabankalan City|Negros Occidental":[9.9895,122.8113],"La Carlota City|Negros Occidental":[10.4244,122.9208],"Silay City|Negros Occidental":[10.8,122.9667],
  "Talisay City|Negros Occidental":[10.7372,122.9672],"Bogo City|Cebu":[11.0517,124.0055],"Toledo City|Cebu":[10.3772,123.6383],
  "Bais City|Negros Oriental":[9.5911,123.1219],"Dumaguete City|Negros Oriental":[9.3068,123.3054],"Baybay City|Leyte":[10.6786,124.8],
  "Maasin City|Southern Leyte":[10.1333,124.8333],"Calbayog City|Western Samar":[12.0667,124.6],"Catbalogan City|Western Samar":[11.7753,124.8861],
  "Dapitan City|Zamboanga Del Norte":[8.6542,123.4244],"Dipolog City|Zamboanga Del Norte":[8.5886,123.3409],"Pagadian City|Zamboanga Del Sur":[7.8257,123.4366],
  "Zamboanga City|Zamboanga Del Sur":[6.9214,122.079],"Malaybalay City|Bukidnon":[8.1575,125.1278],"Valencia City|Bukidnon":[7.9064,125.0938],
  "Oroquieta City|Misamis Occidental":[8.4856,123.8056],"Tangub City|Misamis Occidental":[8.0667,123.75],"Cagayan de Oro City|Misamis Oriental":[8.4542,124.6319],
  "Gingoog City|Misamis Oriental":[8.8167,125.1],"Island Garden City of Samal|Davao (Del Norte)":[7.0733,125.7061],"Panabo City|Davao (Del Norte)":[7.3075,125.6839],
  "Tagum City|Davao (Del Norte)":[7.4478,125.8037],"Davao City|Davao Del Sur":[7.0731,125.6128],"Mati City|Davao Oriental":[6.9549,126.2158],
  "City of Koronadal|South Cotabato":[6.5031,124.8469],"Gen. Santos City|South Cotabato":[6.1164,125.1716],"Isabela City|Basilan":[6.7042,121.9711],
  "Lamitan City|Basilan":[6.65,122.1333],"Marawi City|Lanao Del Sur":[8.0,124.2928],"Baguio City|Benguet":[16.4023,120.596],
  "Butuan City|Agusan Del Norte":[8.9475,125.5406],"Bislig City|Surigao Del Sur":[8.2147,126.3158],"Tandag City|Surigao Del Sur":[9.0786,126.1986]
};

// Land-safe layout overrides for provinces whose center/spiral would otherwise land in a bay, gulf or strait.
// [lat, lon, maxRadiusDeg]: spiral is anchored on an inland point and its radius is capped so it stays on land.
export const INLAND = {
  "Pangasinan":[15.95,120.55,0.30],"Bataan":[14.66,120.48,0.09],"Batangas":[13.88,121.12,0.20],"Cavite":[14.32,120.95,0.12],
  "Zambales":[15.40,120.08,0.11],"Bulacan":[14.88,120.97,0.15],"Pampanga":[15.07,120.70,0.12],"La Union":[16.55,120.45,0.10],
  "Ilocos Norte":[18.10,120.65,0.12],"Ilocos Sur":[17.30,120.55,0.10],"Cagayan":[17.75,121.80,0.25],"Isabela":[16.90,121.85,0.25],
  "Quezon":[13.95,121.78,0.15],"Camarines Sur":[13.55,123.30,0.20],"Camarines Norte":[14.15,122.80,0.07],"Albay":[13.20,123.58,0.10],
  "Sorsogon":[12.90,124.00,0.08],"Catanduanes":[13.75,124.28,0.08],"Masbate":[12.20,123.55,0.07],"Cebu":[10.32,123.80,0.10],
  "Bohol":[9.85,124.15,0.12],"Negros Occidental":[10.45,123.00,0.20],"Negros Oriental":[9.55,123.10,0.12],"Iloilo":[10.95,122.50,0.22],
  "Antique":[11.15,122.05,0.10],"Aklan":[11.65,122.35,0.07],"Capiz":[11.45,122.65,0.08],"Leyte":[10.95,124.85,0.14],
  "Western Samar":[11.75,125.0,0.12],"Eastern Samar":[11.45,125.45,0.08],"Northern Samar":[12.35,124.55,0.08],"Southern Leyte":[10.30,125.0,0.05],
  "Zamboanga Del Sur":[7.85,123.45,0.12],"Zamboanga Del Norte":[8.45,123.20,0.10],"Zamboanga Sibugay":[7.75,122.65,0.08],
  "Misamis Occidental":[8.35,123.65,0.08],"Misamis Oriental":[8.50,124.75,0.10],"Lanao Del Norte":[8.00,124.00,0.08],
  "Davao Del Sur":[6.75,125.35,0.06],"Agusan Del Norte":[8.95,125.55,0.06],"Surigao Del Norte":[9.60,125.55,0.06],
  "Surigao Del Sur":[8.75,126.15,0.10],"Palawan":[9.75,118.75,0.12],"Occidental Mindoro":[13.0,120.85,0.10],"Oriental Mindoro":[12.95,121.25,0.10],
  "Rizal":[14.60,121.25,0.07],"Laguna":[14.22,121.35,0.10],"Aurora":[15.85,121.55,0.05],"Romblon":[12.55,122.30,0.05]
};
