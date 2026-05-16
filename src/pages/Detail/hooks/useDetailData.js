import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const useDetailData = (perjalananId, user) => {
  const [detailPerjalanan, setDetailPerjalanan] = useState([]);
  const [resultUangHarian, setResultUangHarian] = useState([]);
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [dataDalamKota, setDataDalamKota] = useState(null);
  const [dataTemplate, setDataTemplate] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAuto, setIsCreatingAuto] = useState(false);
  const [isCreatingAutoBulk, setIsCreatingAutoBulk] = useState(false);
  const [isSubmittingPengajuan, setIsSubmittingPengajuan] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const [validasiRillError, setValidasiRillError] = useState(null);

  const toast = useToast();

  async function fetchDataPerjalan() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/detail-perjalanan/${perjalananId}`
      );
      setDetailPerjalanan(res.data.result);
      setResultUangHarian(res.data.resultUangHarian || []);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubKegiatan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/get-filter/${user[0]?.unitKerja_profile?.id}`
      )
      .then((res) => {
        setDataSubKegiatan(res.data.result);
        console.log(res.data.result, "SUB KEGIATAN");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataDalamKota() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/dalam-kota/get/dalam-kota/${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`
      )
      .then((res) => {
        setDataDalamKota(res.data.result);
        console.log(res.data.result, "DALAM KOTA");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchTemplate() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get-all-kwitansi`
      )
      .then((res) => {
        setDataTemplate(res.data.result || []);
        // Set default template ID ke template pertama jika ada
        if (res.data.result && res.data.result.length > 0) {
          setTemplateId(res.data.result[0].id);
        }
        console.log(res.data.result, "TEMPLATE");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDataPerjalan(),
        fetchSubKegiatan(),
        fetchDataDalamKota(),
        fetchTemplate(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  // Refresh data ketika randomNumber berubah
  useEffect(() => {
    if (randomNumber > 0) {
      fetchDataPerjalan();
    }
  }, [randomNumber]);

  // Fungsi untuk menghitung total durasi
  const totalDurasi = detailPerjalanan?.tempats?.reduce(
    (total, tempat) => total + tempat.dalamKota.durasi,
    0
  );

  // Fungsi buat otomatis untuk personil
  const buatOtomatis = (personilId) => {
    const maxTransport = detailPerjalanan?.tempats?.reduce(
      (max, tempat) =>
        tempat.dalamKota.uangTransport > max.dalamKota.uangTransport
          ? tempat
          : max,
      detailPerjalanan.tempats[0]
    );

    setIsCreatingAuto(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/kwitansi-otomatis`,
        {
          personilId: personilId,
          subKegiatan: detailPerjalanan.daftarSubKegiatan.subKegiatan,
          uangHarian: resultUangHarian?.[0]?.nilai,
          uangTransport: maxTransport.dalamKota.uangTransport,
          tempatNama: maxTransport.dalamKota.nama,
          asal: detailPerjalanan.asal,
          totalDurasi,
          pelayananKesehatan: detailPerjalanan.pelayananKesehatan,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataPerjalan();
        toast({
          title: "Berhasil!",
          description: "Rincian biaya berhasil dibuat otomatis",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsCreatingAuto(false);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            "Terjadi kesalahan saat membuat rincian otomatis",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsCreatingAuto(false);
      });
  };

  // Fungsi buat otomatis untuk semua personil sekaligus (bulk)
  const buatOtomatisBulk = async () => {
    if (detailPerjalanan.jenisPerjalanan?.tipePerjalananId !== 1) {
      toast({
        title: "Error",
        description: "Fitur ini hanya tersedia untuk perjalanan dalam kota",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!detailPerjalanan.tempats || detailPerjalanan.tempats.length === 0) {
      toast({
        title: "Error",
        description: "Data tempat tidak ditemukan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const personilsWithoutRincian = detailPerjalanan.personils.filter(
      (personil) =>
        !personil.rincianBPDs || personil.rincianBPDs.length === 0
    );

    if (personilsWithoutRincian.length === 0) {
      toast({
        title: "Info",
        description: "Semua personil sudah memiliki rincian biaya perjalanan",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreatingAutoBulk(true);

    try {
      const maxTransport = detailPerjalanan.tempats.reduce(
        (max, tempat) =>
          tempat.dalamKota.uangTransport > max.dalamKota.uangTransport
            ? tempat
            : max,
        detailPerjalanan.tempats[0]
      );

      const personilsData = await Promise.all(
        personilsWithoutRincian.map(async (personil) => {
          let uangHarian = resultUangHarian?.[0]?.nilai;

          if (!uangHarian) {
            try {
              const rampungResponse = await axios.get(
                `${
                  import.meta.env.VITE_REACT_APP_API_BASE_URL
                }/kwitansi/get/rampung/${personil.id}`,
                { params: { unitKerjaId: user[0]?.unitKerja_profile.id } }
              );
              uangHarian =
                rampungResponse.data?.resultUangHarian?.[0]?.nilai ||
                resultUangHarian?.[0]?.nilai;
            } catch (err) {
              console.error(
                `Error fetching uang harian for personil ${personil.id}:`,
                err
              );
              uangHarian = resultUangHarian?.[0]?.nilai;
            }
          }

          return {
            personilId: personil.id,
            uangHarian: uangHarian || 0,
            uangTransport: maxTransport.dalamKota.uangTransport,
            tempatNamaPersonil: maxTransport.dalamKota.nama,
            asalPersonil: detailPerjalanan.asal,
          };
        })
      );

      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/kwitansi-otomatis-bulk`,
        {
          id: detailPerjalanan.id,
          totalDurasi: totalDurasi,
          personils: personilsData,
          tempatNama: maxTransport.dalamKota.nama,
          asal: detailPerjalanan.asal,
          pelayananKesehatan: detailPerjalanan.pelayananKesehatan,
        }
      );

      console.log("Bulk response:", response.data);

      toast({
        title: "Berhasil!",
        description: `Rincian biaya berhasil dibuat otomatis untuk ${personilsData.length} personil`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchDataPerjalan();
    } catch (err) {
      console.error("Error bulk:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "Terjadi kesalahan saat membuat rincian otomatis untuk semua personil",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreatingAutoBulk(false);
    }
  };

  // Fungsi pengajuan untuk semua personil sekaligus (bulk)
  const pengajuanBulk = async () => {
    const personilsToSubmit = detailPerjalanan.personils?.filter(
      (personil) => personil.statusId === 1 || personil.statusId === 4
    );

    if (!personilsToSubmit || personilsToSubmit.length === 0) {
      toast({
        title: "Info",
        description: "Tidak ada personil yang dapat diajukan",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validasi untuk Perjalanan Dinas Dalam Kota (jenisPerjalanan.id === 2):
    // Total nilai rincian jenis Rill per personil tidak boleh melebihi uangTransport maksimal
    const jenisPerjalananId = detailPerjalanan.jenisPerjalanan?.id;
    if (jenisPerjalananId === 2) {
      const tempats = detailPerjalanan.tempats || [];
      const maxUangTransport =
        tempats.length > 0
          ? Math.max(
              ...tempats.map((t) => Number(t?.dalamKota?.uangTransport) || 0)
            )
          : 0;

      const personilGagal = personilsToSubmit.find((personil) => {
        const totalNilaiRill = (
          personil.rincianBPDs?.filter(
            (item) =>
              (item.jenisRincianBPD?.jenis || "").toLowerCase() === "rill"
          ) || []
        ).reduce((sum, item) => {
          const nilai = Number(item.nilai) || 0;
          const qty = Number(item.qty) || 0;
          return sum + nilai * qty;
        }, 0);
        return totalNilaiRill > maxUangTransport;
      });

      if (personilGagal) {
        const totalNilaiRill = (
          personilGagal.rincianBPDs?.filter(
            (item) =>
              (item.jenisRincianBPD?.jenis || "").toLowerCase() === "rill"
          ) || []
        ).reduce((sum, item) => {
          const nilai = Number(item.nilai) || 0;
          const qty = Number(item.qty) || 0;
          return sum + nilai * qty;
        }, 0);
        setValidasiRillError({
          totalNilaiRill,
          maxUangTransport,
          namaPegawai: personilGagal.pegawai?.nama || "Personil",
        });
        return;
      }
    }

    setIsSubmittingPengajuan(true);

    try {
      const pengajuanData = personilsToSubmit.map((personil) => ({
        personilId: personil.id,
        perjalananId: detailPerjalanan.id,
      }));

      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/pengajuan-bulk`,
        {
          pengajuanData: pengajuanData,
        }
      );

      console.log("Pengajuan bulk berhasil:", response.data);
      toast({
        title: "Berhasil!",
        description: `Pengajuan berhasil dikirim untuk ${personilsToSubmit.length} personil.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await fetchDataPerjalan();
    } catch (err) {
      console.error("Error pengajuan bulk:", err);

      if (err.response?.status === 404 || err.response?.status === 400) {
        try {
          const promises = personilsToSubmit.map((personil) =>
            axios.post(
              `${
                import.meta.env.VITE_REACT_APP_API_BASE_URL
              }/kwitansi/post/pengajuan/${personil.id}`,
              {
                perjalananId: detailPerjalanan.id,
              }
            )
          );

          await Promise.all(promises);

          toast({
            title: "Berhasil!",
            description: `Pengajuan berhasil dikirim untuk ${personilsToSubmit.length} personil.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          await fetchDataPerjalan();
        } catch (parallelErr) {
          console.error("Error pengajuan paralel:", parallelErr);
          toast({
            title: "Error!",
            description:
              err.response?.data?.message ||
              "Terjadi kesalahan saat mengirim pengajuan.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Error!",
          description:
            err.response?.data?.message ||
            "Terjadi kesalahan saat mengirim pengajuan.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmittingPengajuan(false);
    }
  };

  // Fungsi cetak semua kwitansi untuk semua personil sekaligus
  const cetakSemuaKwitansi = async (selectedTemplateId = templateId || 1) => {
    // Filter personil yang sudah memiliki rincianBPDs dan statusId >= 2
    const personilsToPrint = detailPerjalanan.personils?.filter(
      (personil) => 
        personil.rincianBPDs && 
        personil.rincianBPDs.length > 0 &&
        personil.statusId >= 2
    );

    if (!personilsToPrint || personilsToPrint.length === 0) {
      toast({
        title: "Info",
        description: "Tidak ada personil yang dapat dicetak kwitansinya",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsPrintingAll(true);

    try {
      // Siapkan data semua personil untuk dicetak
      const personilsData = personilsToPrint.map((personil) => ({
        personilId: personil.id,
        pegawaiNama: personil.pegawai?.nama,
        pegawaiNip: personil.pegawai?.nip,
        pegawaiJabatan: personil.pegawai?.jabatan,
        nomorSPD: personil.nomorSPD,
        rincianBPD: personil.rincianBPDs,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kwitansi/post/cetak-kwitansi-bulk`,
        {
          perjalananId: detailPerjalanan.id,
          nomorST: detailPerjalanan.noSuratTugas,
          untuk: detailPerjalanan.untuk,
          // Data PPTK
          PPTKNama: detailPerjalanan.PPTK?.pegawai_PPTK?.nama,
          PPTKNip: detailPerjalanan.PPTK?.pegawai_PPTK?.nip,
          PPTKJabatan: detailPerjalanan.PPTK?.jabatan,
          // Data KPA
          KPANama: detailPerjalanan.KPA?.pegawai_KPA?.nama,
          KPANip: detailPerjalanan.KPA?.pegawai_KPA?.nip,
          KPAJabatan: detailPerjalanan.KPA?.jabatan,
          // Data Bendahara
          bendaharaNama: detailPerjalanan.bendahara?.pegawai_bendahara?.nama,
          bendaharaNip: detailPerjalanan.bendahara?.pegawai_bendahara?.nip,
          bendaharaJabatan: detailPerjalanan.bendahara?.jabatan,
          dataBendahara: detailPerjalanan.bendahara,
          // Data lainnya
          foto: detailPerjalanan.fotoPerjalanans || [],
          templateId: selectedTemplateId,
          subKegiatan: detailPerjalanan.daftarSubKegiatan?.subKegiatan,
          kodeRekening: `${detailPerjalanan.daftarSubKegiatan?.kodeRekening || ""}${detailPerjalanan.jenisPerjalanan?.kodeRekening || ""}`,
          tanggalPengajuan: detailPerjalanan.tanggalPengajuan,
          jenis: detailPerjalanan.jenisPerjalanan?.id,
          tempat: detailPerjalanan.tempats,
          jenisPerjalanan: detailPerjalanan.jenisPerjalanan?.jenis,
          tahun: new Date(detailPerjalanan.tanggalPengajuan).getFullYear(),
          indukUnitKerja: user[0]?.unitKerja_profile?.indukUnitKerja?.indukUnitKerja,
          personils: personilsData,
        },
        {
          responseType: "blob",
        }
      );

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `kwitansi_semua_personil_${detailPerjalanan.id}.docx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil!",
        description: `Kwitansi berhasil diunduh untuk ${personilsToPrint.length} personil.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error cetak semua kwitansi:", err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.message || "Gagal mengunduh file kwitansi.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPrintingAll(false);
    }
  };

  // Cek apakah semua personil belum memiliki rincianBPDs
  const semuaPersonilBelumAdaRincian =
    detailPerjalanan.personils &&
    detailPerjalanan.personils.length > 0 &&
    detailPerjalanan.personils.every(
      (personil) =>
        !personil.rincianBPDs || personil.rincianBPDs.length === 0
    );

  // Cek apakah ada personil yang bisa diajukan
  const adaPersonilYangBisaDiajukan =
    detailPerjalanan.personils?.some(
      (personil) => personil.statusId === 1 || personil.statusId === 4
    );

  // Ambil semua statusId dari personils
  const statusIds = detailPerjalanan?.personils?.map((item) => item.statusId);

  // Cek apakah ada statusId yang 2 atau 3
  const adaStatusDuaAtauTiga = statusIds?.includes(2) || statusIds?.includes(3);

  // Cek apakah ada personil yang bisa dicetak kwitansinya (sudah ada rincian dan statusId >= 2)
  const adaPersonilYangBisaDicetak = detailPerjalanan.personils?.some(
    (personil) =>
      personil.rincianBPDs &&
      personil.rincianBPDs.length > 0 &&
      personil.statusId >= 2
  );

  /**
   * Mengirim data ke API untuk menyimpan perubahan nomor surat (no. surat tugas, no. nota dinas, nomor SPD per personil).
   * @param {Object} updates - { noSuratTugas, noNotaDinas, personilNomorSPD: [{ personilId, nomorSPD }] }
   * @returns {Promise<void>}
   */
  const simpanEditNomorSurat = async (updates) => {
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/perjalanan/edit-nomor-surat/${perjalananId}`,
      {
        noSuratTugas: updates.noSuratTugas ?? null,
        noNotaDinas: updates.noNotaDinas ?? null,
        personilNomorSPD: updates.personilNomorSPD ?? [],
      }
    );
    await fetchDataPerjalan();
    return response.data;
  };

  return {
    state: {
      detailPerjalanan,
      resultUangHarian,
      dataSubKegiatan,
      dataDalamKota,
      dataTemplate,
      templateId,
      isLoading,
      isCreatingAuto,
      isCreatingAutoBulk,
      isSubmittingPengajuan,
      isPrintingAll,
      randomNumber,
      totalDurasi,
      semuaPersonilBelumAdaRincian,
      adaPersonilYangBisaDiajukan,
      adaStatusDuaAtauTiga,
      adaPersonilYangBisaDicetak,
      validasiRillError,
    },
    actions: {
      fetchDataPerjalan,
      buatOtomatis,
      buatOtomatisBulk,
      pengajuanBulk,
      cetakSemuaKwitansi,
      simpanEditNomorSurat,
      setRandomNumber,
      setTemplateId,
      clearValidasiRillError: () => setValidasiRillError(null),
    },
  };
};

export default useDetailData;
