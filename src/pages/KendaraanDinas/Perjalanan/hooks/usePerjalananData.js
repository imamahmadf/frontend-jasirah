// src/pages/Perjalanan/hooks/usePerjalananData.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

const usePerjalananData = (user) => {
  const [dataPegawai, setDataPegawai] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");
  const [klasifikasi, setKlasifikasi] = useState(null);
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState(null);
  const [dataSeed, setDataSeed] = useState([]);
  const [untuk, setUntuk] = useState("");
  const [dasar, setDasar] = useState(null);
  const [asal, setAsal] = useState(user[0]?.unitKerja_profile?.asal);
  const [dataTtdNotaDinas, setDataTtdNotaDinas] = useState(null);
  const [dataTtdSuratTugas, setDataTtdSuratTugas] = useState(null);
  const [dataPPTK, setDataPPTK] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [dataKPA, setDataKPA] = useState(null);
  const [jenisPerjalanan, setJenisPerjalanan] = useState([]);
  const [dataKota, setDataKota] = useState([
    { dataDalamKota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [dataSubKegiatan, setDataSubKegiatan] = useState([]);
  const [tanggalBerangkat, setTanggalBerangkat] = useState("");
  const [tanggalPulang, setTanggalPulang] = useState("");
  const [perjalananKota, setPerjalananKota] = useState([
    { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKlasifikasi, setDataKlasifikasi] = useState([]);
  const [dataKodeKlasifikasi, setDataKodeKlasifikasi] = useState(null);
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [dataBendahara, setDataBendahara] = useState(null);
  const [jenisPelayananKesehatan, setJenisPelayananKesehatan] = useState(1);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState([]);
  const [isSrikandi, setIsSrikandi] = useState(1);
  const [isNotaDinas, setIsNotaDinas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dataTemplate, setDataTemplate] = useState([]);

  const toast = useToast();
  const history = useHistory();

  const handleChange = (e, field) => {
    const { value } = e.target;
    if (field === "pengajuan") {
      setTanggalPengajuan(value);
    } else if (field === "berangkat") {
      setTanggalBerangkat(value);
    } else if (field === "pulang") {
      setTanggalPulang(value);
    }
  };

  const handleSelectChange = (selectedOption, pegawaiIndex) => {
    if (selectedOption) {
      const newPegawaiList = [...selectedPegawai];
      newPegawaiList[pegawaiIndex] = selectedOption;
      setSelectedPegawai(newPegawaiList);
    }
  };

  const handlePerjalananChange = (index, field, value) => {
    const newPerjalanan = [...perjalananKota];
    newPerjalanan[index][field] = value;
    setPerjalananKota(newPerjalanan);
  };

  const handleDalamKotaChange = (index, field, value) => {
    const newDalamKota = [...dataKota];
    newDalamKota[index][field] = value;
    setDataKota(newDalamKota);
  };

  const addPerjalanan = () => {
    setPerjalananKota([
      ...perjalananKota,
      { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const addDataKota = () => {
    setDataKota([
      ...dataKota,
      { dataDalamKota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const submitPerjalanan = (values) => {
    console.log(values);
    console.log(selectedPegawai);
    setIsLoading(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/post/kendaraan-dinas`,
        {
          pegawai: values.personil,
          dataTtdSurTug: dataTtdSuratTugas,
          dataTtdNotaDinas,
          PPTKId: dataPPTK.value.id,
          tanggalPengajuan: values.pengajuan,
          noSurat: dataSeed?.resultDaftarNomorSurat,
          subKegiatanId: values.subKegiatan.value.id,
          untuk: values.untuk,
          dasar: values.dasar,
          asal: values.asal,
          kodeRekeningFE: `${dataSubKegiatan?.value?.kodeRekening}${jenisPerjalanan.value.kodeRekening}`,
          subKegiatan: dataSubKegiatan.value.subKegiatan,
          ttdNotDis: dataTtdNotaDinas,
          perjalananKota,
          jenis: jenisPerjalanan.value,
          dalamKota: dataKota,
          tanggalBerangkat,
          tanggalPulang,
          indukUnitKerjaFE: values.subKegiatan.value.daftarUnitKerja,
          KPAId: dataKPA.value.id,
          kodeKlasifikasi: dataKodeKlasifikasi,
          dataBendaharaId: values.bendahara.value.id,
          pelayananKesehatanId: jenisPelayananKesehatan,
          isSrikandi: 0,
          isNotaDinas,
        },
        { responseType: "blob" }
      )
      .then((res) => {
        // Jika isNotaDinas === 2, langsung redirect tanpa generate file word

        toast({
          title: "Berhasil",
          description: "Data perjalanan berhasil disimpan",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        history.push("/perjalanan/daftar");
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat mengunduh file",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      });
  };

  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`
      );
      setDataPegawai(res.data);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function fetchSeedPerjalanan() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/seed-kendaraan?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&unitKerjaId=${user[0]?.unitKerja_profile?.id}`
      );
      setDataSeed(res.data);
      console.log(res.data, "cek data seed");
      if (res.data.resultPPTK?.length > 0) {
        setDataPPTK({
          value: res.data.resultPPTK[0],
          label: res.data.resultPPTK[0]?.pegawai_PPTK?.nama,
        });
      }

      if (res.data.resultKPA?.length > 0) {
        setDataKPA({
          value: res.data.resultKPA[0],
          label: res.data.resultKPA[0]?.pegawai_KPA?.nama,
        });
      }

      if (res.data.resultUnitKerja?.length > 0) {
        setDataKPA({
          value: res.data.resultUnitKerja[0],
          label: res.data.resulUnitKerja[0]?.unitKerja,
        });
      }

      if (res.data.resultTtdNotaDinas?.length > 0) {
        setDataTtdNotaDinas({
          value: res.data.resultTtdNotaDinas[0],
          label: res.data.resultTtdNotaDinas[0]?.pegawai_notaDinas?.nama,
        });
      }

      if (res.data.resultTtdSuratTugas?.length > 0) {
        setDataTtdSuratTugas({
          value: res.data.resultTtdSuratTugas[0],
          label: res.data.resultTtdSuratTugas[0]?.pegawai?.nama,
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  const fetchJenisPerjalanan = async (id) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/jenis-perjalanan/${id}`
      );
      setDataJenisPerjalanan(res.data.result);
      console.log(res.data.result, "JENIS PERJALANANNN!!!!");
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchDataKodeKlasifikasi = async (id) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/klasifikasi/get/kode-klasifikasi/${id}`
      );
      setKodeKlasifikasi(res.data.result);
      setDataKlasifikasi(res.data.result);
    } catch (err) {
      console.error(err.message);
    }
  };

  async function fetchTemplate() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get/${
          user[0].unitKerja_profile.indukUnitKerja.id
        }`
      );
      setDataTemplate(res.data.result);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    fetchDataPegawai();
    fetchSeedPerjalanan();
    fetchTemplate();
  }, []);

  return {
    state: {
      dataPegawai,
      tanggalPengajuan,
      klasifikasi,
      kodeKlasifikasi,
      untuk,
      dasar,
      asal,
      dataTtdNotaDinas,
      dataTtdSuratTugas,
      dataPPTK,
      dataKPA,
      jenisPerjalanan,
      tanggalBerangkat,
      tanggalPulang,
      dataKlasifikasi,
      dataKodeKlasifikasi,
      dataSumberDana,
      dataBendahara,
      jenisPelayananKesehatan,
      dataJenisPerjalanan,
      isSrikandi,
      isNotaDinas,
      isLoading,
      dataSubKegiatan,
      dataKegiatan,
    },
    actions: {
      handleChange,
      handleSelectChange,
      handlePerjalananChange,
      handleDalamKotaChange,
      addPerjalanan,
      addDataKota,
      submitPerjalanan,
      setKlasifikasi,
      fetchDataKodeKlasifikasi,
      setDataKodeKlasifikasi,
      setUntuk,
      setDasar,
      setAsal,
      setDataTtdNotaDinas,
      setDataTtdSuratTugas,
      setDataPPTK,
      setDataKPA,
      setJenisPerjalanan,
      setDataSumberDana,
      fetchJenisPerjalanan,
      setDataBendahara,
      setJenisPelayananKesehatan,
      setIsSrikandi,
      setIsNotaDinas,
      setDataSubKegiatan,
      setDataKegiatan,
      setSelectedPegawai,
    },
    isLoading,
    dataTemplate,
    selectedPegawai,
    dataSeed,
    dataKota,
    perjalananKota,
  };
};

export default usePerjalananData;
