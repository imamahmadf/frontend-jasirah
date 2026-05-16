import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import { Link, useHistory } from "react-router-dom";
import Rill from "../Componets/Rill";
import { useDisclosure } from "@chakra-ui/react";
import Foto from "../assets/add_photo.png";
import TambahBuktiKegiatan from "../Componets/TambahBuktiKegiatan";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useFormik } from "formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { BsFileEarmark } from "react-icons/bs";

import YupPassword from "yup-password";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  Heading,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Image,
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Select,
  Td,
  Flex,
  Textarea,
  Alert,
  Toast,
  Input,
  FormHelperText,
  Spacer,
  VStack,
  FormErrorMessage,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Avatar,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../Redux/Reducers/auth";
import Loading from "../Componets/Loading";

function Rampung(props) {
  const toast = useToast();
  const [randomNumber, setRandomNumber] = useState(0);
  const inputFileRef = useRef(null);
  const [dataRampung, setDataRampung] = useState([]);
  const [templateId, setTemplateId] = useState(
    dataRampung?.template?.[0]?.id || null
  );
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSizeMsg, setFileSizeMsg] = useState("");
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState(null);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [bendaharaSelected, setBendaharaSelected] = useState(null);
  const {
    isOpen: isInputOpen,
    onOpen: onInputOpen,
    onClose: onInputClose,
  } = useDisclosure();
  const {
    isOpen: isValidasiRillOpen,
    onOpen: onValidasiRillOpen,
    onClose: onValidasiRillClose,
  } = useDisclosure();
  const [validasiRillData, setValidasiRillData] = useState({
    totalNilaiRill: 0,
    maxUangTransport: 0,
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const validationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required("File harus diunggah")
      .test(
        "fileType",
        "Format file tidak valid. Harap unggah file .pdf",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file terlalu besar. Maksimal 2 MB",
        (value) => value && value.size <= 2 * 1024 * 1024
      ),
  });

  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/template/download-undangan`,
        {
          params: { fileName },

          responseType: "blob",
        }
      );

      // Membuat URL untuk file yang akan diunduh
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat mengunduh file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  function renderTemplate() {
    return dataRampung.template?.map((val) => {
      return (
        <option key={val.id} value={val.id}>
          {val.nama}
        </option>
      );
    });
  }

  function renderJenis() {
    return dataRampung.jenisRampung?.map((val) => {
      return (
        <option key={val.id} value={val.id}>
          {val.jenis}
        </option>
      );
    });
  }

  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseRupiah = (str) => {
    if (!str) return 0;
    const onlyDigits = str.toString().replace(/[^0-9]/g, "");
    return onlyDigits ? parseInt(onlyDigits, 10) : 0;
  };

  const pengajuan = () => {
    if (!dataRampung.result.id) {
      console.error("ID tidak valid");
      return;
    }

    // Validasi untuk Perjalanan Dinas Dalam Kota (jenisPerjalanan.id === 2):
    // Total nilai rincian jenis Rill tidak boleh melebihi uangTransport maksimal dari tempats
    const jenisPerjalananId = dataRampung.result?.perjalanan?.jenisPerjalanan?.id;
    if (jenisPerjalananId === 2) {
      const tempats = dataRampung.result?.perjalanan?.tempats || [];
      const maxUangTransport =
        tempats.length > 0
          ? Math.max(
              ...tempats.map((t) => Number(t?.dalamKota?.uangTransport) || 0)
            )
          : 0;

      const totalNilaiRill = (
        dataRampung.result?.rincianBPDs?.filter(
          (item) =>
            (item.jenisRincianBPD?.jenis || "").toLowerCase() === "rill"
        ) || []
      ).reduce((sum, item) => {
        const nilai = Number(item.nilai) || 0;
        const qty = Number(item.qty) || 0;
        return sum + nilai * qty;
      }, 0);

      if (totalNilaiRill > maxUangTransport) {
        setValidasiRillData({ totalNilaiRill, maxUangTransport });
        onValidasiRillOpen();
        return;
      }
    }

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/pengajuan/${dataRampung.result.id}`,
        {
          perjalananId: dataRampung.result.perjalanan.id,
        }
      )
      .then((response) => {
        // Tindakan setelah berhasil
        console.log("Pengajuan berhasil:", response.data);
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataRampung();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Terjadi kesalahan saat mengirim pengajuan.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const daftarTempat = dataRampung?.result?.perjalanan?.tempats?.map(
    (tempat, index) =>
      `${
        dataRampung.result.perjalanan.jenisPerjalanan?.tipePerjalananId === 1
          ? tempat.dalamKota.nama
          : tempat.tempat
      }${
        index < dataRampung?.result?.perjalanan?.tempats.length - 1 ? `, ` : ``
      }`
  );

  const handleFile = (event) => {
    if (event.target.files[0].size / 1024 > 1024) {
      setFileSizeMsg("File size is greater than maximum limit");
    } else {
      setSelectedFile(event.target.files[0]);
      let preview = document.getElementById("imgpreview");
      preview.src = URL.createObjectURL(event.target.files[0]);
      formik.setFieldValue("pic", event.target.files[0]);
    }
  };
  // Menambahkan totalDuras
  const totalDurasi = dataRampung?.result?.perjalanan?.tempats?.reduce(
    (total, tempat) => total + tempat.dalamKota.durasi, // Asumsi durasi ada di dalamKota
    0 // nilai awal
  );
  const buatOtomatis = () => {
    const maxTransport = dataRampung?.result?.perjalanan?.tempats?.reduce(
      (max, tempat) =>
        tempat.dalamKota.uangTransport > max.dalamKota.uangTransport
          ? tempat
          : max,
      dataRampung.result.perjalanan.tempats[0] // nilai awal
    );

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/kwitansi-otomatis`,
        {
          personilId: dataRampung.result.id,

          subKegiatan:
            dataRampung.result.perjalanan.daftarSubKegiatan.subKegiatan,
          // kodeRekening: `${dataRampung.result.perjalanan.daftarSubKegiatan.kegiatan.kodeRekening}${dataRampung.result.perjalanan.daftarSubKegiatan.kodeRekening}`,
          uangHarian: dataRampung?.resultUangHarian[0].nilai,
          uangTransport: maxTransport.dalamKota.uangTransport,
          tempatNama: maxTransport.dalamKota.nama,
          asal: dataRampung.result.perjalanan.asal,
          totalDurasi,
          pelayananKesehatan: dataRampung.result.perjalanan.pelayananKesehatan,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataRampung();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const cetak = () => {
    setIsPrinting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/cetak-kwitansi`,
        {
          id: dataRampung.result.id,
          indukUnitKerja:
            user[0]?.unitKerja_profile.indukUnitKerja.indukUnitKerja,
          nomorSPD: dataRampung.result.nomorSPD,
          nomorST: dataRampung?.result?.perjalanan.noSuratTugas,
          pegawaiNama: dataRampung.result.pegawai.nama,
          pegawaiNip: dataRampung.result.pegawai.nip,
          pegawaiJabatan: dataRampung.result.pegawai.jabatan,
          untuk: dataRampung.result.perjalanan.untuk,
          PPTKNama: dataRampung.result.perjalanan.PPTK.pegawai_PPTK.nama,
          PPTKNip: dataRampung.result.perjalanan.PPTK.pegawai_PPTK.nip,
          KPANama: dataRampung.result.perjalanan.KPA.pegawai_KPA.nama,
          KPANip: dataRampung.result.perjalanan.KPA.pegawai_KPA.nip,
          KPAJabatan: dataRampung.result.perjalanan.KPA.jabatan,
          foto: dataRampung?.result?.perjalanan?.fotoPerjalanans || [],
          templateId,
          subKegiatan:
            dataRampung.result.perjalanan.daftarSubKegiatan.subKegiatan,
          kodeRekening: `${dataRampung.result.perjalanan.daftarSubKegiatan.kodeRekening}${dataRampung.result.perjalanan.jenisPerjalanan.kodeRekening}`,
          rincianBPD: dataRampung.result.rincianBPDs,
          tanggalPengajuan: dataRampung.result.perjalanan.tanggalPengajuan,
          totalDurasi,
          jenis: dataRampung.result.perjalanan.jenisPerjalanan.id,
          tempat: dataRampung.result.perjalanan.tempats,
          jenisPerjalanan: dataRampung.result.perjalanan.jenisPerjalanan.jenis,
          dataBendahara: dataRampung.result.perjalanan.bendahara,
          tahun: new Date(
            dataRampung?.result?.perjalanan.tanggalPengajuan
          ).getFullYear(),
          // untukPembayaran:
          //   dataRampung.result.perjalanan.bendahara.sumberDana.untukPembayaran,
        },
        {
          responseType: "blob",
        }
      )
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `kuitansi_${dataRampung?.result?.pegawai?.nama}${props.match.params.id}.docx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: "Berhasil!",
          description: "File berhasil diunduh.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal mengunduh file.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsPrinting(false);
      });
  };

  // const cetak = () => {
  //   setIsPrinting(true);
  //   axios
  //     .post(
  //       `${
  //         import.meta.env.VITE_REACT_APP_API_BASE_URL
  //       }/kwitansi/post/cetak-kwitansi-pdf`,
  //       {
  //         id: dataRampung.result.id,
  //         indukUnitKerja:
  //           user[0]?.unitKerja_profile.indukUnitKerja.indukUnitKerja,
  //         nomorSPD: dataRampung.result.nomorSPD,
  //         nomorST: dataRampung?.result?.perjalanan.noSuratTugas,
  //         pegawaiNama: dataRampung.result.pegawai.nama,
  //         pegawaiNip: dataRampung.result.pegawai.nip,
  //         pegawaiJabatan: dataRampung.result.pegawai.jabatan,
  //         untuk: dataRampung.result.perjalanan.untuk,
  //         PPTKNama: dataRampung.result.perjalanan.PPTK.pegawai_PPTK.nama,
  //         PPTKNip: dataRampung.result.perjalanan.PPTK.pegawai_PPTK.nip,
  //         KPANama: dataRampung.result.perjalanan.KPA.pegawai_KPA.nama,
  //         KPANip: dataRampung.result.perjalanan.KPA.pegawai_KPA.nip,
  //         KPAJabatan: dataRampung.result.perjalanan.KPA.jabatan,
  //         templateId,
  //         subKegiatan:
  //           dataRampung.result.perjalanan.daftarSubKegiatan.subKegiatan,
  //         kodeRekening: `${dataRampung.result.perjalanan.daftarSubKegiatan.kodeRekening}${dataRampung.result.perjalanan.jenisPerjalanan.kodeRekening}`,
  //         rincianBPD: dataRampung.result.rincianBPDs,
  //         tanggalPengajuan: dataRampung.result.perjalanan.tanggalPengajuan,
  //         totalDurasi,
  //         jenis: dataRampung.result.perjalanan.jenisPerjalanan.id,
  //         tempat: dataRampung.result.perjalanan.tempats,
  //         jenisPerjalanan: dataRampung.result.perjalanan.jenisPerjalanan.jenis,
  //         dataBendahara: dataRampung.result.perjalanan.bendahara,
  //         tahun: new Date(
  //           dataRampung?.result?.perjalanan.tanggalPengajuan
  //         ).getFullYear(),
  //       },
  //       {
  //         responseType: "blob", // penting untuk file binary
  //       }
  //     )
  //     .then((res) => {
  //       const url = window.URL.createObjectURL(new Blob([res.data]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute(
  //         "download",
  //         `kwitansi_${dataRampung?.result?.pegawai?.nama}_${dataRampung?.result?.id}.pdf` // ubah ke .pdf
  //       );
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();

  //       toast({
  //         title: "Berhasil!",
  //         description: "File PDF berhasil diunduh.",
  //         status: "success",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       toast({
  //         title: "Error!",
  //         description: "Gagal mengunduh file PDF.",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     })
  //     .finally(() => {
  //       setIsPrinting(false);
  //     });
  // };

  YupPassword(Yup);

  // /////////////

  const formik = useFormik({
    initialValues: {
      item: "",
      satuan: "",
      // harga: "",
      qty: 0,
      nilai: 0,

      jenis: 0,
    },
    // onSubmit: (values) => {
    //   alert(JSON.stringify(values, null, 2));
    // },
    validationSchema: Yup.object().shape({
      item: Yup.string().required("Mo. Batch wajib diisi"),
      satuan: Yup.string().required("tanganggal kadaluarsa wajib diisi"),
      // harga: Yup.number("masukkan angka").required("harga satuan wajib disi"),
      qty: Yup.number("masukkan angka").required(
        "masukkan jumlah obat perkotak"
      ),
      nilai: Yup.number("masukkan angka").required("Perusahaan wajib diisi"),

      jenis: Yup.number("masukkan angka").required("stok obat wajib disi"),
    }),
    validateOnChange: false,
    onSubmit: async (values) => {
      // console.log(values, "tes formik");
      const { item, satuan, qty, nilai, jenis } = values;

      // kirim data ke back-end
      const formData = new FormData();
      formData.append("item", item);
      formData.append("satuan", satuan);
      formData.append("qty", qty);
      formData.append("nilai", nilai);
      formData.append("jenisId", jenis);
      formData.append("personilId", props.match.params.id);
      formData.append("pic", selectedFile);

      await axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/kwitansi/post/rampung`,
          formData
        )
        .then((res) => {
          // Menampilkan toast setelah berhasil
          console.log(res.data);
          fetchDataRampung();
          onInputClose();
          toast({
            title: "Berhasil!",
            description: "Data Nomor Batch berhasil disimpan.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          // Reset form dan state setelah berhasil

          // Arahkan pengguna ke halaman lain (misalnya daftar obat)
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  // ////////////

  const handleEdit = (item) => {
    setEditMode(item.id);
    setEditedData({
      ...item,
    });
  };

  const handleChange = (e, field) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = (id) => {
    console.log(editedData);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/update/rincian-bpd`,
        editedData
      )
      .then((res) => {
        setEditMode(null);
        fetchDataRampung();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  async function fetchDataRampung() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kwitansi/get/rampung/${
          props.match.params.id
        }`,
        { unitKerjaId: user[0]?.unitKerja_profile.id }
      )
      .then((res) => {
        console.log(res.data);
        setDataRampung(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function hapusBPD(val) {
    console.log(val);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/delete/rincian-bpd`,
        {
          id: val.id,
        }
      )
      .then((res) => {
        console.log(res.data);
        onDeleteClose();
        fetchDataRampung();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataRampung();
  }, [randomNumber]);

  useEffect(() => {
    if (dataRampung?.dataBendahara?.length > 0) {
      setBendaharaSelected(dataRampung.dataBendahara[0]);
    }
  }, [dataRampung]);

  useEffect(() => {
    if (dataRampung?.template?.length > 0) {
      setTemplateId(dataRampung.template[0].id);
    }
  }, [dataRampung]);

  // Kelompokkan rincianBPDs berdasarkan jenis
  const groupedData =
    dataRampung.result?.rincianBPDs?.reduce((acc, item) => {
      const jenis = item.jenisRincianBPD?.jenis;
      if (!acc[jenis]) {
        acc[jenis] = [];
      }
      acc[jenis].push(item);
      return acc;
    }, {}) || {};
  const grandTotal = Object.values(groupedData)
    .flat()
    .reduce((sum, item) => {
      // Validasi data sebelum perhitungan
      const nilai = Number(item.nilai) || 0;
      const qty = Number(item.qty) || 0;

      // Debug khusus untuk jenis "Rill"
      if (item.jenisRincianBPD?.jenis === "Rill") {
        console.log(`=== RILL ITEM DEBUG ===`);
        console.log(`Item: ${item.item}`);
        console.log(`Jenis: ${item.jenisRincianBPD?.jenis}`);
        console.log(`Nilai: ${item.nilai}`);
        console.log(`Qty: ${item.qty}`);
        console.log(`Tipe Data Nilai:`, typeof item.nilai);
        console.log(`Tipe Data Qty:`, typeof item.qty);
        console.log(`Is Nilai NaN:`, isNaN(item.nilai));
        console.log(`Is Qty NaN:`, isNaN(item.qty));
        console.log(`Raw Nilai:`, item.nilai);
        console.log(`Raw Qty:`, item.qty);
        console.log(
          `PERHATIAN: Untuk jenis Rill, TIDAK ada rillTotal tambahan!`
        );
        console.log(
          `Total Rill = nilai × qty = ${nilai} × ${qty} = ${nilai * qty}`
        );
        console.log(`========================`);
      }

      // Hitung total untuk item utama (nilai * qty)
      const itemTotal = nilai * qty;

      // Hitung total untuk rills jika ada (hanya untuk jenis non-Rill)
      let rillTotal = 0;
      if (item.jenisRincianBPD?.jenis !== "Rill") {
        rillTotal =
          item.rills?.reduce(
            (rillSum, rill) => rillSum + (Number(rill.nilai) || 0),
            0
          ) || 0;
      }

      // Debug: log perhitungan untuk setiap item dengan detail lebih lengkap
      console.log(`=== DETAIL ITEM ===`);
      console.log(`Item: ${item.item}`);
      console.log(`Jenis: ${item.jenisRincianBPD?.jenis}`);
      console.log(`Raw Nilai: ${item.nilai} (${typeof item.nilai})`);
      console.log(`Raw Qty: ${item.qty} (${typeof item.qty})`);
      console.log(`Validated Nilai: ${nilai}`);
      console.log(`Validated Qty: ${qty}`);
      console.log(`ItemTotal (nilai × qty): ${itemTotal}`);
      console.log(`Rills:`, item.rills);
      console.log(`RillTotal: ${rillTotal}`);
      console.log(`Total Per Item: ${itemTotal + rillTotal}`);
      console.log(`====================`);

      // Return total item + total rills (untuk non-Rill)
      return sum + itemTotal + rillTotal;
    }, 0);

  // Debug: log total keseluruhan dan detail groupedData
  console.log("=== RAW DATA ===");
  console.log("Data Rampung Result:", dataRampung?.result);
  console.log("Rincian BPDs:", dataRampung?.result?.rincianBPDs);
  console.log("=================");

  console.log("=== GROUPED DATA ===");
  console.log("Grouped Data:", groupedData);
  console.log("===================");

  console.log("=== PERHITUNGAN ===");
  console.log("Grand Total:", grandTotal);
  console.log("===================");

  const getStatusBgColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "gelap";
      case 2:
        return "ungu";
      case 3:
        return "primary";
      case 4:
        return "danger";
      default:
        return "gray.200";
    }
  };

  const getStatusTextColor = (statusId) => {
    if (statusId === 1 || statusId === 2 || statusId === 3 || statusId === 4) {
      return "white";
    }
    return "gray.700";
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "Pending";
      case 2:
        return "Menunggu Verifikasi";
      case 3:
        return "Diverifikasi";
      case 4:
        return "Diproses";
      case 5:
        return "Selesai";
      default:
        return "Unknown";
    }
  };

  // Cek apakah user memiliki keuangan nonaktif
  const isKeuanganNonaktif =
    user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan === "nonaktif";

  // Helper function untuk mengecek apakah user bisa menambah/edit
  const canAddOrEdit = () => {
    if (isKeuanganNonaktif) {
      return true; // Jika keuangan nonaktif, selalu bisa menambah/edit
    }
    // Jika keuangan aktif, cek status seperti biasa
    return (
      dataRampung?.result?.statusId !== 3 &&
      dataRampung?.result?.statusId !== 2
    );
  };

  // Helper function untuk mengecek apakah user bisa mencetak
  const canPrint = () => {
    if (isKeuanganNonaktif) {
      return true; // Jika keuangan nonaktif, selalu bisa mencetak
    }
    // Jika keuangan aktif, hanya bisa mencetak jika status = 3 (Diverifikasi)
    return dataRampung?.result?.statusId === 3;
  };

  return (
    <Layout>
      {isPrinting && <Loading />}
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="1400px" px={4}>
          {/* Header Section */}
          <Box mb={8}>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Box
                  bgColor="primary"
                  width="30px"
                  height="30px"
                  borderRadius="md"
                ></Box>
                <Heading color="primary" size="lg">
                  Data Rampung
                </Heading>
              </HStack>
              <Badge
                bgColor={getStatusBgColor(dataRampung?.result?.status?.id)}
                color={getStatusTextColor(dataRampung?.result?.status?.id)}
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="md"
              >
                {dataRampung?.result?.status?.statusKuitansi ||
                  "Unknown Status"}
              </Badge>
            </Flex>
          </Box>

          {/* Main Content Grid */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 400px" }}
            gap={8}
            mb={8}
          >
            {/* Left Column - Bukti Kegiatan & Undangan */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Bukti Kegiatan Card */}
                <Card shadow="lg" borderRadius="xl" overflow="hidden">
                  <CardHeader bg="ungu" color="white" py={6}>
                    <Heading size="md">Bukti Kegiatan</Heading>
                  </CardHeader>
                  <CardBody p={0}>
                    <TambahBuktiKegiatan
                      fotoPerjalanan={
                        dataRampung?.result?.perjalanan?.fotoPerjalanans || []
                      }
                      id={dataRampung?.result?.perjalanan?.id}
                      status={dataRampung?.result?.status?.id}
                      randomNumber={setRandomNumber}
                    />
                  </CardBody>
                </Card>

                {/* Undangan Card */}
                {dataRampung?.result?.perjalanan?.undangan ? (
                  <Card shadow="md" borderRadius="lg">
                    <CardHeader bg="green.50" py={4}>
                      <Heading size="sm" color="green.700">
                        File Undangan
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Button
                        gap="10px"
                        w="100%"
                        variant="primary"
                        onClick={() =>
                          handleDownload(
                            dataRampung?.result?.perjalanan?.undangan
                          )
                        }
                        leftIcon={<Icon as={BsFileEarmark} />}
                      >
                        Download Undangan
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  <Card shadow="md" borderRadius="lg">
                    <CardHeader bg="orange.50" py={4}>
                      <Heading size="sm" color="orange.700">
                        Upload Undangan
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Formik
                        initialValues={{ file: null, jenis: null }}
                        validationSchema={validationSchema}
                        onSubmit={async (
                          values,
                          { setSubmitting, resetForm }
                        ) => {
                          console.log("Nilai yang dikirim:", values.jenis);
                          const formData = new FormData();
                          formData.append("file", values.file);
                          formData.append(
                            "id",
                            dataRampung.result.perjalanan.id
                          );

                          try {
                            const response = await axios.post(
                              `${
                                import.meta.env.VITE_REACT_APP_API_BASE_URL
                              }/template/upload-undangan`,
                              formData,
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                              }
                            );

                            toast({
                              title: "Sukses!",
                              description: response.data.message,
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            });

                            resetForm();
                            setSelectedFile(null);
                            fetchTemplate();
                          } catch (error) {
                            toast({
                              title: "Gagal Mengunggah",
                              description:
                                "Terjadi kesalahan saat mengunggah file",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }

                          setSubmitting(false);
                        }}
                      >
                        {({ setFieldValue, isSubmitting, errors, touched }) => (
                          <Form>
                            <VStack spacing={4} align="stretch">
                              <FormControl
                                isInvalid={errors.file && touched.file}
                              >
                                <Input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(event) => {
                                    setFieldValue(
                                      "file",
                                      event.currentTarget.files[0]
                                    );
                                    setSelectedFile(
                                      event.currentTarget.files[0]
                                    );
                                  }}
                                  p={1}
                                />
                                <FormErrorMessage>
                                  {errors.file}
                                </FormErrorMessage>
                              </FormControl>

                              {selectedFile && (
                                <Text fontSize="sm" color="gray.600">
                                  File: {selectedFile.name}
                                </Text>
                              )}

                              <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                isDisabled={!selectedFile}
                                w="100%"
                              >
                                Upload
                              </Button>
                            </VStack>
                          </Form>
                        )}
                      </Formik>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </GridItem>

            {/* Right Column - Information */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Basic Info Card */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="gray.50" py={4}>
                    <Heading size="sm" color="gray.700">
                      Informasi Dasar
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                          mb={2}
                        >
                          Nama Pegawai
                        </Text>
                        <HStack spacing={3} align="start">
                          {dataRampung?.result?.pegawai?.profiles?.[0]
                            ?.profilePic ? (
                            <Image
                              src={`${
                                import.meta.env.VITE_REACT_APP_API_BASE_URL
                              }${
                                dataRampung.result.pegawai.profiles[0]
                                  .profilePic
                              }`}
                              alt={dataRampung?.result?.pegawai?.nama || "Foto"}
                              width="80px"
                              height="80px"
                              objectFit="cover"
                              borderRadius="md"
                              bg="gray.200"
                            />
                          ) : (
                            <Box
                              width="80px"
                              height="80px"
                              bg="primary"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="bold"
                              fontSize="lg"
                              flexShrink={0}
                            >
                              {dataRampung?.result?.pegawai?.nama
                                ?.charAt(0)
                                .toUpperCase() || "-"}
                            </Box>
                          )}
                          <VStack spacing={1} align="start">
                            <Text fontSize="md" fontWeight="medium">
                              {dataRampung?.result?.pegawai?.nama || "-"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {dataRampung?.result?.pegawai?.nip || "-"}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Asal
                        </Text>
                        <Text fontSize="md">
                          {dataRampung?.result?.perjalanan?.asal || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Tujuan
                        </Text>
                        {dataRampung?.result?.perjalanan?.jenisPerjalanan
                          ?.tipePerjalananId === 1 ? (
                          <VStack align="stretch" spacing={2} mt={1}>
                            {dataRampung?.result?.perjalanan?.tempats?.map(
                              (tempat, index) => (
                                <HStack key={index} spacing={2} align="center">
                                  <Text fontSize="md">
                                    {tempat?.dalamKota?.nama ?? tempat?.tempat ?? "-"}
                                  </Text>
                                  {tempat?.dalamKota?.status && (
                                    <Badge
                                      colorScheme={
                                        tempat.dalamKota.status === "aktif"
                                          ? "green"
                                          : "gray"
                                      }
                                      fontSize="xs"
                                    >
                                      {tempat.dalamKota.status}
                                    </Badge>
                                  )}
                                </HStack>
                              )
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="md">{daftarTempat || "-"}</Text>
                        )}
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Nomor ST
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {dataRampung?.result?.perjalanan.noSuratTugas || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Nomor SPD
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {dataRampung?.result?.nomorSPD || "-"}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Personnel Info Card */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="purple.50" py={4}>
                    <Heading size="sm" color="purple.700">
                      Personil Terkait
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          PPTK
                        </Text>
                        <Text fontSize="md">
                          {dataRampung?.result?.perjalanan.PPTK?.pegawai_PPTK
                            ?.nama || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          PA/KPA
                        </Text>
                        <Text fontSize="md">
                          {dataRampung?.result?.perjalanan.KPA?.pegawai_KPA
                            ?.nama || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Bendahara
                        </Text>
                        <Text fontSize="md">
                          {dataRampung?.result?.perjalanan.bendahara
                            ?.pegawai_bendahara?.nama || "-"}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Template Selection */}
                {canPrint() && (
                  <Card shadow="md" borderRadius="lg">
                    <CardHeader bg="orange.50" py={4}>
                      <Heading size="sm" color="orange.700">
                        Pilih Template
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl>
                        <Select
                          size="lg"
                          bg="white"
                          borderRadius="md"
                          borderColor="gray.300"
                          defaultValue={dataRampung?.template?.[0]?.id}
                          onChange={(e) => {
                            setTemplateId(e.target.value);
                          }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "outline",
                          }}
                        >
                          {renderTemplate()}
                        </Select>
                      </FormControl>
                    </CardBody>
                  </Card>
                )}

                {/* Catatan */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="teal.50" py={4}>
                    <Heading size="sm" color="teal.700">
                      Catatan
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="md">
                      {dataRampung?.result?.catatan || "Tidak Ada Catatan"}
                    </Text>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>

          {/* Detail Rampung Section */}
          <Card shadow="xl" borderRadius="xl" mb={8}>
            <CardHeader bg="primary" color="white" py={6}>
              <Flex justify="space-between" align="center">
                <HStack>
                  <Box
                    bgColor="white"
                    width="30px"
                    height="30px"
                    borderRadius="md"
                  ></Box>
                  <Heading size="md" color="white">
                    Detail Rampung
                  </Heading>
                </HStack>
                <Flex gap={3}>
                  <Rill
                    data={dataRampung?.daftarRill}
                    personilId={dataRampung?.result?.id}
                    randomNumber={setRandomNumber}
                    status={dataRampung?.result?.statusId}
                  />
                  {canPrint() && (
                    <Button variant="primary" onClick={cetak} size="lg">
                      CETAK
                    </Button>
                  )}
                  {canAddOrEdit() && (
                    <Button onClick={onInputOpen} variant="primary" size="lg">
                      Tambah +
                    </Button>
                  )}
                  {dataRampung?.result?.perjalanan?.jenisPerjalanan
                    ?.tipePerjalananId === 1 &&
                    dataRampung?.result?.rincianBPDs.length === 0 && (
                      <Button
                        variant="primary"
                        onClick={buatOtomatis}
                        size="lg"
                      >
                        Buat Otomatis
                      </Button>
                    )}
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody p={8}>
              {Object.keys(groupedData).length > 0 ? (
                <VStack spacing={6} align="stretch">
                  {Object.keys(groupedData).map((jenis) => (
                    <Box key={jenis}>
                      <Heading
                        size="md"
                        color="gray.700"
                        mb={4}
                        pb={2}
                        borderBottom="2px solid"
                        borderColor="gray.200"
                      >
                        {jenis}
                      </Heading>
                      <Box overflowX="auto">
                        <Table
                          variant="simple"
                          size="md"
                          tableLayout="fixed"
                          width="100%"
                        >
                          <Thead bg="gray.50">
                            <Tr>
                              <Th style={{ width: "25%" }}>Item</Th>
                              <Th isNumeric style={{ width: "15%" }}>
                                Nilai
                              </Th>
                              <Th isNumeric style={{ width: "10%" }}>
                                Qty
                              </Th>
                              <Th style={{ width: "10%" }}>Satuan</Th>
                              <Th isNumeric style={{ width: "15%" }}>
                                Total
                              </Th>
                              <Th style={{ width: "15%" }}>Bukti</Th>
                              {canAddOrEdit() && (
                                <Th style={{ width: "10%" }}>Aksi</Th>
                              )}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {groupedData[jenis].map((item) => (
                              <Tr key={item.id} _hover={{ bg: "gray.50" }}>
                                <Td width="25%">
                                  {editMode === item.id ? (
                                    <Input
                                      value={editedData.item}
                                      onChange={(e) => handleChange(e, "item")}
                                      size="sm"
                                    />
                                  ) : (
                                    <Text fontWeight="medium">{item.item}</Text>
                                  )}
                                </Td>
                                <Td width="15%" isNumeric>
                                  {editMode === item.id ? (
                                    <Input
                                      type="number"
                                      value={editedData.nilai}
                                      onChange={(e) => handleChange(e, "nilai")}
                                      size="sm"
                                    />
                                  ) : (
                                    <Text
                                      fontFamily="mono"
                                      fontWeight="semibold"
                                    >
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(item.nilai)}
                                    </Text>
                                  )}
                                </Td>
                                <Td isNumeric>
                                  {editMode === item.id ? (
                                    <Input
                                      type="number"
                                      value={editedData.qty}
                                      onChange={(e) => handleChange(e, "qty")}
                                      size="sm"
                                    />
                                  ) : (
                                    <Text fontWeight="medium">{item.qty}</Text>
                                  )}
                                </Td>
                                <Td>
                                  {editMode === item.id ? (
                                    <Input
                                      value={editedData.satuan}
                                      onChange={(e) =>
                                        handleChange(e, "satuan")
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    <Text>{item.satuan}</Text>
                                  )}
                                </Td>
                                <Td isNumeric>
                                  {editMode === item.id ? (
                                    <Text
                                      fontFamily="mono"
                                      fontWeight="semibold"
                                    >
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(item.nilai * item.qty)}
                                    </Text>
                                  ) : (
                                    <Text
                                      fontFamily="mono"
                                      fontWeight="semibold"
                                    >
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(item.nilai * item.qty)}
                                    </Text>
                                  )}
                                </Td>
                                <Td>
                                  <Image
                                    borderRadius="md"
                                    alt="Bukti"
                                    width="80px"
                                    height="60px"
                                    objectFit="cover"
                                    src={
                                      item.bukti
                                        ? import.meta.env
                                            .VITE_REACT_APP_API_BASE_URL +
                                          item.bukti
                                        : Foto
                                    }
                                    cursor="pointer"
                                    _hover={{ opacity: 0.8 }}
                                    transition="opacity 0.2s"
                                    />
                                </Td>
                                {canAddOrEdit() && (
                                    <Td>
                                      {editMode === item.id ? (
                                        <HStack spacing={2}>
                                          <Button
                                            colorScheme="green"
                                            size="sm"
                                            onClick={() => handleSave(item.id)}
                                          >
                                            Simpan
                                          </Button>
                                          <Button
                                            colorScheme="gray"
                                            size="sm"
                                            onClick={() => setEditMode(null)}
                                          >
                                            Batal
                                          </Button>
                                        </HStack>
                                      ) : (
                                        <HStack spacing={2}>
                                          {jenis !== "Rill" && (
                                            <>
                                              <Button
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => handleEdit(item)}
                                              >
                                                Edit
                                              </Button>
                                              <Button
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => {
                                                  setItemToDelete(item);
                                                  onDeleteOpen();
                                                }}
                                              >
                                                Hapus
                                              </Button>
                                            </>
                                          )}
                                        </HStack>
                                      )}
                                    </Td>
                                  )}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={12}>
                  <Text fontSize="lg" color="gray.500">
                    Tidak ada data untuk ditampilkan.
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Action & Total Section */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <Flex justify="space-between" align="center">
                <Box>
                  {dataRampung?.result?.statusId === 1 ||
                  dataRampung?.result?.statusId === 4 ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        pengajuan();
                      }}
                    >
                      Ajukan
                    </Button>
                  ) : null}
                </Box>
                <Box textAlign="right">
                  <Stat>
                    <StatLabel fontSize="lg" color="gray.600">
                      TOTAL KESELURUHAN
                    </StatLabel>
                    <StatNumber
                      fontSize="3xl"
                      color="primary"
                      fontWeight="bold"
                    >
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(grandTotal)}
                    </StatNumber>
                    <StatHelpText color="gray.500">
                      Total biaya perjalanan dinas
                    </StatHelpText>
                  </Stat>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Breakdown Perhitungan - Development Only */}
        </Container>
      </Box>

      {/* Modal Peringatan Validasi Rill (Dalam Kota) */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isValidasiRillOpen}
        onClose={onValidasiRillClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" maxWidth="500px">
          <ModalHeader color="red.600">Validasi Gagal</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={2}>
              Total nilai rincian <strong>Rill</strong> tidak boleh melebihi uang
              transport maksimal untuk perjalanan dalam kota.
            </Text>
            <VStack align="stretch" spacing={2} py={2}>
              <Flex justify="space-between">
                <Text color="gray.600">Total nilai Rill:</Text>
                <Text fontWeight="semibold" color="red.600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(validasiRillData.totalNilaiRill)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">Batas maksimal:</Text>
                <Text fontWeight="semibold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(validasiRillData.maxUangTransport)}
                </Text>
              </Flex>
            </VStack>
            <Text fontSize="sm" color="gray.600">
              Silakan perbaiki rincian BPD agar total nilai Rill tidak melebihi
              batas di atas, lalu ajukan kembali.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onValidasiRillClose}>
              Mengerti
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" maxWidth="500px">
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak
              dapat dibatalkan.
            </Text>
            <Button
              onClick={() => {
                hapusBPD(itemToDelete);
              }}
              colorScheme="red"
              w="100%"
            >
              Hapus
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Input Modal */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isInputOpen}
        onClose={onInputClose}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" maxWidth="800px">
          <ModalHeader>Tambah Rincian Biaya</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel fontSize="lg" fontWeight="semibold">
                  Item
                </FormLabel>
                <Input
                  placeholder="Contoh: Hotel"
                  height="50px"
                  bgColor="gray.50"
                  type="text"
                  border="1px solid"
                  borderColor="gray.300"
                  onChange={(e) => {
                    formik.setFieldValue("item", e.target.value);
                  }}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                {formik.errors.item && (
                  <FormErrorMessage>{formik.errors.item}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="lg" fontWeight="semibold">
                  Satuan
                </FormLabel>
                <Input
                  placeholder="Contoh: malam"
                  height="50px"
                  bgColor="gray.50"
                  type="text"
                  border="1px solid"
                  borderColor="gray.300"
                  onChange={(e) => {
                    formik.setFieldValue("satuan", e.target.value);
                  }}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                {formik.errors.satuan && (
                  <FormErrorMessage>{formik.errors.satuan}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="lg" fontWeight="semibold">
                  Quantity
                </FormLabel>
                <Input
                  placeholder="Contoh: 1"
                  height="50px"
                  bgColor="gray.50"
                  type="number"
                  border="1px solid"
                  borderColor="gray.300"
                  onChange={(e) => {
                    formik.setFieldValue("qty", e.target.value);
                  }}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                {formik.errors.qty && (
                  <FormErrorMessage>{formik.errors.qty}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="lg" fontWeight="semibold">
                  Nilai
                </FormLabel>
                <Input
                  placeholder="Contoh: Rp 5.000.000"
                  height="50px"
                  bgColor="gray.50"
                  type="text"
                  inputMode="numeric"
                  border="1px solid"
                  borderColor="gray.300"
                  value={formatRupiah(formik.values.nilai)}
                  onChange={(e) => {
                    const parsed = parseRupiah(e.target.value);
                    formik.setFieldValue("nilai", parsed);
                  }}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                {formik.errors.nilai && (
                  <FormErrorMessage>{formik.errors.nilai}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="lg" fontWeight="semibold">
                  Jenis
                </FormLabel>
                <Select
                  placeholder="Pilih Jenis"
                  height="50px"
                  bgColor="gray.50"
                  borderRadius="md"
                  borderColor="gray.300"
                  onChange={(e) => {
                    formik.setFieldValue("jenis", parseInt(e.target.value));
                  }}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                >
                  {renderJenis()}
                </Select>
                {formik.errors.jenis && (
                  <FormErrorMessage>{formik.errors.jenis}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <Input
                  onChange={handleFile}
                  ref={inputFileRef}
                  accept="image/png, image/jpeg"
                  display="none"
                  type="file"
                />
              </FormControl>

              <FormControl>
                <Image
                  src={Foto}
                  id="imgpreview"
                  alt="Preview"
                  width="100%"
                  height="200px"
                  objectFit="cover"
                  borderRadius="md"
                  border="2px dashed"
                  borderColor="gray.300"
                />
              </FormControl>

              <FormControl>
                <FormHelperText color="gray.500">
                  Maksimal ukuran: 1MB
                </FormHelperText>
                <Button
                  variant="outline"
                  w="100%"
                  onClick={() => inputFileRef.current.click()}
                  size="lg"
                >
                  Pilih Foto
                </Button>
                {fileSizeMsg && (
                  <Alert status="error" borderRadius="md">
                    <Text>{fileSizeMsg}</Text>
                  </Alert>
                )}
              </FormControl>

              <Button
                onClick={formik.handleSubmit}
                variant={"primary"}
                size="lg"
                w="100%"
              >
                Simpan
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default Rampung;
