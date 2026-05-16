import axios from "axios";

export const fetchDataPegawai = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`
  );
  return response.data;
};

export const fetchSeedPerjalanan = async (unitKerja) => {
  const response = await axios.get(
    `${
      import.meta.env.VITE_REACT_APP_API_BASE_URL
    }/perjalanan/get/seed?indukUnitKerjaId=${
      user[0]?.unitKerja_profile?.indukUnitKerja.id
    }&unitKerjaId=${user[0]?.unitKerja_profile?.id}`
  );
  return response;
};

export const fetchTemplate = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template`
  );
  return response.data;
};
