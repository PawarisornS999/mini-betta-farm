declare module "thai-address-database" {
  export type ThaiAddress = {
    district: string;
    amphoe: string;
    province: string;
    zipcode: string;
  };

  export function searchAddressByProvince(
    searchStr: string,
    maxResult?: number,
  ): ThaiAddress[];
}