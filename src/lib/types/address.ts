export interface Address {
  id: number;
  user_id: number;
  address: string;
  country_id: number;
  state_id: number;
  city_id: number;
  area_id: number;
  country_name: string;
  state_name: string | null;
  city_name: string;
  area_name: string | null;
  postal_code: string;
  phone: string;
  set_default: number;
  location_available: boolean;
  lat: number;
  lang: number;
  valid: boolean;
}

export interface Country { id: number; name: string; code: string; }
export interface State { id: number; name: string; country_id: number; }
export interface City { id: number; name: string; state_id: number; }
export interface Area { id: number; name: string; city_id: number; }
