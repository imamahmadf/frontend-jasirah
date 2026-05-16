import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
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
  Heading,
  SimpleGrid,
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useColorMode,
  Divider,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import ExcelJS from "exceljs";

function RekapAdminAset(props) {
  const [DataPersediaan, setDataPersediaan] = useState([]);
  const [showDetailTable, setShowDetailTable] = useState({});
  const history = useHistory();

  const [page, setPage] = useState(0);

  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const user = useSelector(userRedux);
  const role = useSelector(selectRole);

  // (dipindah ke bawah setelah variabel dependensi dideklarasikan)

  const totalNilaiAsetAkhir = useMemo(() => {
    if (!Array.isArray(DataPersediaan)) return 0;
    return DataPersediaan.reduce((sumKategori, kategori) => {
      if (!kategori.barang || kategori.barang.length === 0) return sumKategori;
      const subtotalKategori = kategori.barang.reduce((sumBarang, item) => {
        if (!item.detailStokMasuk || item.detailStokMasuk.length === 0)
          return sumBarang;
        const subtotalBarang = item.detailStokMasuk.reduce((sumDetail, d) => {
          const stokAkhir = Number(d.stokAkhir) || 0;
          const harga = Number(d.hargaSatuan) || 0;
          return sumDetail + stokAkhir * harga;
        }, 0);
        return sumBarang + subtotalBarang;
      }, 0);
      return sumKategori + subtotalKategori;
    }, 0);
  }, [DataPersediaan]);

  const totalMutasiMasuk = useMemo(() => {
    if (!Array.isArray(DataPersediaan)) return 0;
    return DataPersediaan.reduce((sumKategori, kategori) => {
      if (!kategori.barang || kategori.barang.length === 0) return sumKategori;
      const subtotalKategori = kategori.barang.reduce((sumBarang, item) => {
        if (!item.detailStokMasuk || item.detailStokMasuk.length === 0)
          return sumBarang;
        const subtotalBarang = item.detailStokMasuk.reduce((sumDetail, d) => {
          const stokMasuk = Number(d.stokMasuk) || 0;
          const harga = Number(d.hargaSatuan) || 0;
          return sumDetail + stokMasuk * harga;
        }, 0);
        return sumBarang + subtotalBarang;
      }, 0);
      return sumKategori + subtotalKategori;
    }, 0);
  }, [DataPersediaan]);

  const totalMutasiKeluar = useMemo(() => {
    if (!Array.isArray(DataPersediaan)) return 0;
    return DataPersediaan.reduce((sumKategori, kategori) => {
      if (!kategori.barang || kategori.barang.length === 0) return sumKategori;
      const subtotalKategori = kategori.barang.reduce((sumBarang, item) => {
        if (!item.detailStokMasuk || item.detailStokMasuk.length === 0)
          return sumBarang;
        const subtotalBarang = item.detailStokMasuk.reduce((sumDetail, d) => {
          const stokKeluar = Number(d.stokKeluar) || 0;
          const harga = Number(d.hargaSatuan) || 0;
          return sumDetail + stokKeluar * harga;
        }, 0);
        return sumBarang + subtotalBarang;
      }, 0);
      return sumKategori + subtotalKategori;
    }, 0);
  }, [DataPersediaan]);

  // Saldo awal dihitung dari: saldo akhir - mutasi masuk + mutasi keluar
  const totalNilaiAsetAwal = useMemo(() => {
    const akhir = Number(totalNilaiAsetAkhir) || 0;
    const mutasiIn = Number(totalMutasiMasuk) || 0;
    const mutasiOut = Number(totalMutasiKeluar) || 0;
    return akhir - mutasiIn + mutasiOut;
  }, [totalNilaiAsetAkhir, totalMutasiMasuk, totalMutasiKeluar]);

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Rekap Aset");

      // Set lebar kolom & header tunggal
      worksheet.columns = [
        { header: "No.", key: "no", width: 6 },
        { header: "Kode Barang", key: "kode", width: 18 },
        { header: "Nama Barang", key: "nama", width: 50 },
        { header: "Sumber Dana", key: "sd", width: 28 },
        { header: "Stok Akhir", key: "stokAkhir", width: 14 },
        { header: "Nilai Akhir Aset", key: "nilaiAkhir", width: 20 },
      ];

      // Kumpulkan semua baris dari seluruh kategori, lalu agregasi berdasarkan (kode+nama+sumberDana)
      const aggregateMap = new Map();

      const pushRow = (kode, nama, sumberDanaText, stokAkhir, nilaiAkhir) => {
        const key = `${kode || ""}|${nama || ""}|${sumberDanaText || "-"}`;
        if (!aggregateMap.has(key)) {
          aggregateMap.set(key, {
            kode: kode || "",
            nama: nama || "",
            sumberDana: sumberDanaText || "-",
            stokAkhir: Number(stokAkhir) || 0,
            nilaiAkhir: Number(nilaiAkhir) || 0,
          });
        } else {
          const entry = aggregateMap.get(key);
          entry.stokAkhir += Number(stokAkhir) || 0;
          entry.nilaiAkhir += Number(nilaiAkhir) || 0;
        }
      };

      DataPersediaan.forEach((kategori) => {
        const hasBreakdown =
          kategori.total &&
          kategori.total.berdasarkanSumberDana &&
          kategori.total.berdasarkanSumberDana.length > 0;

        if (hasBreakdown) {
          kategori.total.berdasarkanSumberDana.forEach((sd) => {
            if (sd.detailPersediaan && sd.detailPersediaan.length > 0) {
              sd.detailPersediaan.forEach((detail) => {
                const sumberDanaText = sd.nama;
                const stokAkhir = detail.sisaStok || 0;
                const nilaiAkhir = detail.nilaiStok || 0;
                // Kelompokkan berdasarkan kategori (result.nama), bukan namaBarang
                pushRow(
                  kategori.kodeRekening,
                  kategori.nama,
                  sumberDanaText,
                  stokAkhir,
                  nilaiAkhir
                );
              });
            }
          });
        } else if (kategori.barang && kategori.barang.length > 0) {
          kategori.barang.forEach((item) => {
            const sumberDanaText =
              item.sumberDana && item.sumberDana.length > 0
                ? `${item.sumberDana[0]?.sumber || ""}`
                : "-";
            const stokAkhir = item.stokAkhir || 0;
            const nilaiAkhir =
              item.rataRataHargaSatuan && item.stokAkhir
                ? item.rataRataHargaSatuan * item.stokAkhir
                : 0;
            // Kelompokkan berdasarkan kategori (result.nama), bukan namaBarang
            pushRow(
              kategori.kodeRekening,
              kategori.nama,
              sumberDanaText,
              stokAkhir,
              nilaiAkhir
            );
          });
        }
      });

      // Tulis header sekali
      const headerRow = worksheet.getRow(1);
      headerRow.values = [
        "No.",
        "Kode Barang",
        "Nama Barang",
        "Sumber Dana",
        "Stok Akhir",
        "Nilai Akhir Aset",
      ];
      headerRow.font = { bold: true };

      // Tulis data agregasi
      let rowIndex = 2;
      let grandTotalStok = 0;
      let grandTotalNilai = 0;

      const allEntries = Array.from(aggregateMap.values());
      // Urutkan opsional: berdasarkan nama barang
      allEntries.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));

      allEntries.forEach((e, idx) => {
        worksheet.getRow(rowIndex).values = [
          idx + 1,
          e.kode || "",
          e.nama || "",
          e.sumberDana || "-",
          e.stokAkhir,
          e.nilaiAkhir,
        ];
        grandTotalStok += e.stokAkhir || 0;
        grandTotalNilai += e.nilaiAkhir || 0;
        rowIndex += 1;
      });

      // Baris GRAND TOTAL
      const totalRow = worksheet.getRow(rowIndex);
      totalRow.values = [
        "GRAND TOTAL",
        "",
        "",
        "",
        grandTotalStok,
        grandTotalNilai,
      ];
      totalRow.font = { bold: true };

      // Format angka
      for (let r = 2; r <= worksheet.rowCount; r += 1) {
        const stokCell = worksheet.getCell(r, 5);
        const nilaiCell = worksheet.getCell(r, 6);
        if (typeof stokCell.value === "number") stokCell.numFmt = "#,##0";
        if (typeof nilaiCell.value === "number") nilaiCell.numFmt = "#,##0";
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-aset-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast({
        title: "Gagal mengekspor",
        description: "Terjadi kesalahan saat membuat file Excel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportDetailExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Detail Transaksi Stok Masuk");

      // Set lebar kolom
      worksheet.columns = [
        { header: "No.", key: "no", width: 6 },
        { header: "Kategori", key: "kategori", width: 25 },
        { header: "Kode Barang", key: "kodeBarang", width: 18 },
        { header: "Nama Barang", key: "namaBarang", width: 40 },
        { header: "Tanggal", key: "tanggal", width: 15 },
        { header: "Unit Kerja", key: "unitKerja", width: 20 },
        { header: "Sumber Dana", key: "sumberDana", width: 25 },
        { header: "Spesifikasi", key: "spesifikasi", width: 30 },
        { header: "Stok Awal", key: "stokAwal", width: 12 },
        { header: "Stok Masuk", key: "stokMasuk", width: 12 },
        { header: "Stok Keluar", key: "stokKeluar", width: 12 },
        { header: "Stok Akhir", key: "stokAkhir", width: 12 },
        { header: "Harga Satuan", key: "hargaSatuan", width: 18 },
        { header: "Saldo Awal", key: "saldoAwal", width: 18 },
        { header: "Mutasi Masuk", key: "mutasiMasuk", width: 18 },
        { header: "Mutasi Keluar", key: "mutasiKeluar", width: 18 },
        { header: "Saldo Akhir", key: "saldoAkhir", width: 18 },
        { header: "Keterangan", key: "keterangan", width: 30 },
      ];

      // Tulis header
      const headerRow = worksheet.getRow(1);
      headerRow.values = [
        "No.",
        "Kategori",
        "Kode Barang",
        "Nama Barang",
        "Tanggal",
        "Unit Kerja",
        "Sumber Dana",
        "Spesifikasi",
        "Stok Awal",
        "Stok Masuk",
        "Stok Keluar",
        "Stok Akhir",
        "Harga Satuan",
        "Saldo Awal",
        "Mutasi Masuk",
        "Mutasi Keluar",
        "Saldo Akhir",
        "Keterangan",
      ];
      headerRow.font = { bold: true };

      // Kumpulkan semua data detail transaksi
      let rowIndex = 2;
      let noUrut = 1;
      let grandTotalStokAwal = 0;
      let grandTotalStokMasuk = 0;
      let grandTotalStokKeluar = 0;
      let grandTotalStokAkhir = 0;
      let grandTotalSaldoAwal = 0;
      let grandTotalMutasiMasuk = 0;
      let grandTotalMutasiKeluar = 0;
      let grandTotalSaldoAkhir = 0;

      DataPersediaan.forEach((kategori) => {
        if (kategori.barang && kategori.barang.length > 0) {
          kategori.barang.forEach((item) => {
            if (item.detailStokMasuk && item.detailStokMasuk.length > 0) {
              item.detailStokMasuk.forEach((detail) => {
                const stokAwal = Number(detail.stokAwal) || 0;
                const stokMasuk = Number(detail.stokMasuk) || 0;
                const stokKeluar = Number(detail.stokKeluar) || 0;
                const stokAkhir = Number(detail.stokAkhir) || 0;
                const hargaSatuan = Number(detail.hargaSatuan) || 0;
                const saldoAwal = stokAwal * hargaSatuan;
                const mutasiMasuk = stokMasuk * hargaSatuan;
                const mutasiKeluar = stokKeluar * hargaSatuan;
                const saldoAkhir = stokAkhir * hargaSatuan;

                // Update grand total
                grandTotalStokAwal += stokAwal;
                grandTotalStokMasuk += stokMasuk;
                grandTotalStokKeluar += stokKeluar;
                grandTotalStokAkhir += stokAkhir;
                grandTotalSaldoAwal += saldoAwal;
                grandTotalMutasiMasuk += mutasiMasuk;
                grandTotalMutasiKeluar += mutasiKeluar;
                grandTotalSaldoAkhir += saldoAkhir;

                // Tulis data baris
                worksheet.getRow(rowIndex).values = [
                  noUrut,
                  kategori.nama,
                  item.kodeBarangGabungan || item.kodeBarang,
                  item.namaBarang,
                  detail.tanggal
                    ? new Date(detail.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-",
                  detail.unitKerja ? detail.unitKerja.unitKerja : "-",
                  detail.sumberDana ? detail.sumberDana.sumber : "-",
                  detail.spesifikasi || "-",
                  stokAwal,
                  stokMasuk,
                  stokKeluar,
                  stokAkhir,
                  hargaSatuan,
                  saldoAwal,
                  mutasiMasuk,
                  mutasiKeluar,
                  saldoAkhir,
                  detail.keterangan || "-",
                ];

                rowIndex += 1;
                noUrut += 1;
              });
            }
          });
        }
      });

      // Baris GRAND TOTAL
      const totalRow = worksheet.getRow(rowIndex);
      totalRow.values = [
        "GRAND TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        grandTotalStokAwal,
        grandTotalStokMasuk,
        grandTotalStokKeluar,
        grandTotalStokAkhir,
        "",
        grandTotalSaldoAwal,
        grandTotalMutasiMasuk,
        grandTotalMutasiKeluar,
        grandTotalSaldoAkhir,
        "",
      ];
      totalRow.font = { bold: true };

      // Format angka
      for (let r = 2; r <= worksheet.rowCount; r += 1) {
        // Format kolom stok
        for (let c = 9; c <= 12; c += 1) {
          const cell = worksheet.getCell(r, c);
          if (typeof cell.value === "number") cell.numFmt = "#,##0";
        }
        // Format kolom harga dan nilai
        for (let c = 13; c <= 17; c += 1) {
          const cell = worksheet.getCell(r, c);
          if (typeof cell.value === "number") cell.numFmt = "#,##0";
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detail-transaksi-stok-masuk-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Berhasil mengekspor",
        description:
          "Data Detail Transaksi Stok Masuk berhasil diekspor ke Excel",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Gagal mengekspor",
        description: "Terjadi kesalahan saat membuat file Excel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function fetchDataPersediaan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap-aset/get?laporanId=${props.match.params.id}`
      )
      .then((res) => {
        setDataPersediaan(res.data.result);

        console.log(res.data.result, "INI DATA");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataPersediaan();
  }, [page]);
  return (
    <>
      <LayoutAset>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={"30px"}
            borderRadius={"5px"}
            maxW={"2280px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <Heading mb={"30px"} color={"aset"}>
              Rekap Admin Aset
            </Heading>

            <Box
              bgColor={"gray.100"}
              p={"15px"}
              borderRadius={"5px"}
              borderLeft={"4px solid"}
              borderLeftColor={"aset"}
              mb={"20px"}
            >
              <SimpleGrid columns={4} spacing={6}>
                <Box>
                  <Text fontSize={"14px"} color={"gray.600"}>
                    Saldo Awal
                  </Text>
                  <Text
                    fontSize={"18px"}
                    fontWeight={"bold"}
                    color={"blue.700"}
                  >
                    Rp {totalNilaiAsetAwal.toLocaleString("id-ID")}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize={"14px"} color={"gray.600"}>
                    Saldo Akhir
                  </Text>
                  <Text
                    fontSize={"18px"}
                    fontWeight={"bold"}
                    color={"blue.700"}
                  >
                    Rp {totalNilaiAsetAkhir.toLocaleString("id-ID")}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize={"14px"} color={"gray.600"}>
                    Mutasi Masuk
                  </Text>
                  <Text
                    fontSize={"18px"}
                    fontWeight={"bold"}
                    color={"green.600"}
                  >
                    Rp {totalMutasiMasuk.toLocaleString("id-ID")}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize={"14px"} color={"gray.600"}>
                    Mutasi Keluar
                  </Text>
                  <Text fontSize={"18px"} fontWeight={"bold"} color={"red.600"}>
                    Rp {totalMutasiKeluar.toLocaleString("id-ID")}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Flex mb={"20px"} justify={"flex-end"}>
              <HStack spacing={3}>
                <Button
                  leftIcon={<BsFileEarmarkArrowDown />}
                  colorScheme={"blue"}
                  variant={"outline"}
                  size={"sm"}
                  onClick={handleExportDetailExcel}
                >
                  Export Detail Excel
                </Button>
                <Button
                  leftIcon={<BsFileEarmarkArrowDown />}
                  colorScheme={"green"}
                  variant={"solid"}
                  size={"sm"}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
              </HStack>
            </Flex>

            {DataPersediaan.map((kategori, index) => (
              <Box key={kategori.id} mb={"40px"}>
                <Box
                  bgColor={"aset"}
                  p={"15px"}
                  borderRadius={"5px"}
                  mb={"20px"}
                  color={"white"}
                >
                  <Text fontSize={"18px"} fontWeight={"bold"}>
                    {kategori.nama} (Kode: {kategori.kodeRekening})
                  </Text>
                </Box>

                <Table variant={"aset"} mb={"20px"}>
                  <Thead>
                    <Tr>
                      <Th>No.</Th>
                      <Th>Kode Barang</Th>
                      <Th>Nama Barang</Th>
                      <Th>Sumber Dana</Th>
                      <Th>Stok Akhir</Th>
                      <Th>Nilai Akhir Aset</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {kategori.barang && kategori.barang.length > 0 ? (
                      // Jika ada breakdown berdasarkan sumber dana dengan detailPersediaan, tampilkan per detail
                      kategori.total &&
                      kategori.total.berdasarkanSumberDana &&
                      kategori.total.berdasarkanSumberDana.length > 0 ? (
                        <>
                          {kategori.total.berdasarkanSumberDana.flatMap(
                            (sumberDana, sumberIndex) =>
                              sumberDana.detailPersediaan
                                ? sumberDana.detailPersediaan.map(
                                    (detail, detailIndex) => (
                                      <Tr
                                        key={`${sumberDana.id}-${detail.persediaanId}`}
                                      >
                                        <Td>
                                          {sumberIndex + 1}.{detailIndex + 1}
                                        </Td>
                                        <Td>{detail.kodeBarang}</Td>
                                        <Td>{detail.namaBarang}</Td>
                                        <Td>
                                          <Box>
                                            <Text
                                              fontWeight={"bold"}
                                              color={"purple.600"}
                                            >
                                              {sumberDana.nama}
                                            </Text>
                                            <Text
                                              fontSize={"12px"}
                                              color={"gray.600"}
                                            >
                                              ID: {sumberDana.id}
                                            </Text>
                                          </Box>
                                        </Td>
                                        <Td>{detail.sisaStok}</Td>
                                        <Td>
                                          <Text
                                            fontWeight={"bold"}
                                            color={"blue.600"}
                                          >
                                            Rp{" "}
                                            {detail.nilaiStok.toLocaleString(
                                              "id-ID"
                                            )}
                                          </Text>
                                        </Td>
                                      </Tr>
                                    )
                                  )
                                : []
                          )}

                          {/* Baris TOTAL untuk breakdown berdasarkan sumber dana */}
                          <Tr bgColor={"gray.100"}>
                            <Td
                              colSpan={4}
                              fontWeight={"bold"}
                              textAlign={"center"}
                            >
                              TOTAL
                            </Td>
                            <Td fontWeight={"bold"} color={"blue.600"}>
                              {kategori.total.berdasarkanSumberDana.reduce(
                                (sum, sumberDana) =>
                                  sum +
                                  (sumberDana.detailPersediaan
                                    ? sumberDana.detailPersediaan.reduce(
                                        (detailSum, detail) =>
                                          detailSum + detail.sisaStok,
                                        0
                                      )
                                    : 0),
                                0
                              )}
                            </Td>
                            <Td fontWeight={"bold"} color={"blue.600"}>
                              Rp{" "}
                              {kategori.total.berdasarkanSumberDana
                                .reduce(
                                  (sum, sumberDana) =>
                                    sum +
                                    (sumberDana.detailPersediaan
                                      ? sumberDana.detailPersediaan.reduce(
                                          (detailSum, detail) =>
                                            detailSum + detail.nilaiStok,
                                          0
                                        )
                                      : 0),
                                  0
                                )
                                .toLocaleString("id-ID")}
                            </Td>
                          </Tr>
                        </>
                      ) : (
                        <>
                          {/* Jika tidak ada breakdown, tampilkan data barang seperti biasa */}
                          {kategori.barang.map((item, barangIndex) => (
                            <Tr key={item.persediaanId}>
                              <Td>{barangIndex + 1}</Td>
                              <Td>
                                {item.kodeBarangGabungan || item.kodeBarang}
                              </Td>
                              <Td>{item.namaBarang}</Td>
                              <Td>
                                {item.sumberDana &&
                                item.sumberDana.length > 0 ? (
                                  <Box>
                                    <Text fontWeight={"bold"}>
                                      {item.sumberDana[0]?.sumber}
                                    </Text>
                                    <Text fontSize={"12px"} color={"gray.600"}>
                                      {item.sumberDana[0]?.untukPembayaran}
                                    </Text>
                                  </Box>
                                ) : (
                                  <Text color={"gray.400"}>-</Text>
                                )}
                              </Td>
                              <Td>{item.stokAkhir}</Td>
                              <Td>
                                {item.rataRataHargaSatuan && item.stokAkhir ? (
                                  <Text fontWeight={"bold"} color={"blue.600"}>
                                    Rp{" "}
                                    {(
                                      item.rataRataHargaSatuan * item.stokAkhir
                                    ).toLocaleString("id-ID")}
                                  </Text>
                                ) : (
                                  <Text color={"gray.400"}>-</Text>
                                )}
                              </Td>
                            </Tr>
                          ))}

                          {/* Baris TOTAL untuk data barang biasa */}
                          <Tr bgColor={"gray.100"}>
                            <Td
                              colSpan={4}
                              fontWeight={"bold"}
                              textAlign={"center"}
                            >
                              TOTAL
                            </Td>
                            <Td fontWeight={"bold"} color={"blue.600"}>
                              {kategori.barang.reduce(
                                (sum, item) => sum + (item.stokAkhir || 0),
                                0
                              )}
                            </Td>
                            <Td fontWeight={"bold"} color={"blue.600"}>
                              Rp{" "}
                              {kategori.barang
                                .reduce(
                                  (sum, item) =>
                                    sum +
                                    (item.rataRataHargaSatuan && item.stokAkhir
                                      ? item.rataRataHargaSatuan *
                                        item.stokAkhir
                                      : 0),
                                  0
                                )
                                .toLocaleString("id-ID")}
                            </Td>
                          </Tr>
                        </>
                      )
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign={"center"}>
                          Tidak ada data barang
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>

                {/* Detail Stok Masuk untuk setiap barang */}
                {kategori.barang && kategori.barang.length > 0 && (
                  <Box mb={"30px"}>
                    <HStack mb={"20px"} justify={"space-between"}>
                      <Heading size={"md"} color={"aset"}>
                        Detail Transaksi Stok Masuk
                      </Heading>
                      <Button
                        onClick={() =>
                          setShowDetailTable((prev) => ({
                            ...prev,
                            [kategori.id]: !prev[kategori.id],
                          }))
                        }
                        variant={"outline"}
                        colorScheme={"aset"}
                        size={"sm"}
                        leftIcon={
                          showDetailTable[kategori.id] ? (
                            <Text>−</Text>
                          ) : (
                            <Text>+</Text>
                          )
                        }
                      >
                        {showDetailTable[kategori.id]
                          ? "Sembunyikan Detail"
                          : "Tampilkan Detail"}
                      </Button>
                    </HStack>

                    {showDetailTable[kategori.id] && (
                      <Box ml={"40px"}>
                        <Table variant={"aset"} size={"sm"}>
                          <Thead>
                            <Tr>
                              <Th>No.</Th>
                              <Th>Tanggal</Th>
                              <Th>Unit Kerja</Th>
                              <Th>Sumber Dana</Th>
                              <Th>Spesifikasi</Th>
                              <Th>Stok Awal</Th>
                              <Th>Stok Masuk</Th>
                              <Th>Stok Keluar</Th>
                              <Th>Stok Akhir</Th>
                              <Th>Harga Satuan</Th>
                              <Th>Saldo Awal</Th>
                              <Th>Mutasi Masuk</Th>
                              <Th>Mutasi Keluar</Th>
                              <Th>Saldo Akhir</Th>
                              <Th>Keterangan</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {kategori.barang.map((item, barangIndex) => {
                              if (
                                item.detailStokMasuk &&
                                item.detailStokMasuk.length > 0
                              ) {
                                return (
                                  <>
                                    {/* Baris Judul Barang */}
                                    <Tr
                                      key={`header-${item.persediaanId}`}
                                      bgColor={"gray.200"}
                                    >
                                      <Td
                                        colSpan={15}
                                        fontWeight={"bold"}
                                        fontSize={"16px"}
                                      >
                                        {item.namaBarang} (
                                        {item.kodeBarangGabungan ||
                                          item.kodeBarang}
                                        )
                                      </Td>
                                    </Tr>

                                    {/* Detail Transaksi */}
                                    {item.detailStokMasuk.map(
                                      (detail, detailIndex) => {
                                        const stokAwal =
                                          Number(detail.stokAwal) || 0;
                                        const stokMasuk =
                                          Number(detail.stokMasuk) || 0;
                                        const stokKeluar =
                                          Number(detail.stokKeluar) || 0;
                                        const stokAkhir =
                                          Number(detail.stokAkhir) || 0;

                                        return (
                                          <Tr key={detail.id}>
                                            <Td>{detailIndex + 1}</Td>
                                            <Td>
                                              {detail.tanggal
                                                ? new Date(
                                                    detail.tanggal
                                                  ).toLocaleDateString(
                                                    "id-ID",
                                                    {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                    }
                                                  )
                                                : "-"}
                                            </Td>
                                            <Td>
                                              {detail.unitKerja ? (
                                                <Box>
                                                  <Text
                                                    fontWeight={"bold"}
                                                    fontSize={"12px"}
                                                  >
                                                    {detail.unitKerja.unitKerja}
                                                  </Text>
                                                </Box>
                                              ) : (
                                                <Text color={"gray.400"}>
                                                  -
                                                </Text>
                                              )}
                                            </Td>
                                            <Td>
                                              {detail.sumberDana ? (
                                                <Box>
                                                  <Text
                                                    fontWeight={"bold"}
                                                    fontSize={"12px"}
                                                  >
                                                    {detail.sumberDana.sumber}
                                                  </Text>
                                                </Box>
                                              ) : (
                                                <Text color={"gray.400"}>
                                                  -
                                                </Text>
                                              )}
                                            </Td>
                                            <Td>{detail.spesifikasi || "-"}</Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"gray.600"}
                                              >
                                                {stokAwal}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"green.600"}
                                              >
                                                +{stokMasuk}
                                              </Text>
                                            </Td>
                                            <Td>
                                              {stokKeluar > 0 ? (
                                                <Text
                                                  fontWeight={"bold"}
                                                  color={"red.600"}
                                                >
                                                  -{stokKeluar}
                                                </Text>
                                              ) : (
                                                <Text color={"gray.400"}>
                                                  -
                                                </Text>
                                              )}
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"blue.600"}
                                              >
                                                {stokAkhir}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"green.600"}
                                              >
                                                Rp{" "}
                                                {detail.hargaSatuan.toLocaleString(
                                                  "id-ID"
                                                )}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"blue.600"}
                                              >
                                                Rp{" "}
                                                {(
                                                  stokAwal * detail.hargaSatuan
                                                ).toLocaleString("id-ID")}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"green.600"}
                                              >
                                                Rp{" "}
                                                {(
                                                  stokMasuk * detail.hargaSatuan
                                                ).toLocaleString("id-ID")}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"red.600"}
                                              >
                                                Rp{" "}
                                                {(
                                                  stokKeluar *
                                                  detail.hargaSatuan
                                                ).toLocaleString("id-ID")}
                                              </Text>
                                            </Td>
                                            <Td>
                                              <Text
                                                fontWeight={"bold"}
                                                color={"blue.600"}
                                              >
                                                Rp{" "}
                                                {(
                                                  stokAkhir * detail.hargaSatuan
                                                ).toLocaleString("id-ID")}
                                              </Text>
                                            </Td>
                                            <Td>{detail.keterangan || "-"}</Td>
                                          </Tr>
                                        );
                                      }
                                    )}

                                    {/* Baris TOTAL per Barang */}
                                    <Tr bgColor={"gray.100"}>
                                      <Td
                                        colSpan={5}
                                        fontWeight={"bold"}
                                        textAlign={"center"}
                                      >
                                        TOTAL
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"gray.600"}
                                      >
                                        {item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokAwal) || 0),
                                          0
                                        )}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"green.600"}
                                      >
                                        +
                                        {item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokMasuk) || 0),
                                          0
                                        )}
                                      </Td>
                                      <Td fontWeight={"bold"} color={"red.600"}>
                                        -
                                        {item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokKeluar) || 0),
                                          0
                                        )}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"blue.600"}
                                      >
                                        {item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokAkhir) || 0),
                                          0
                                        )}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"green.600"}
                                      >
                                        Rp{" "}
                                        {Math.round(
                                          item.detailStokMasuk.reduce(
                                            (sum, detail) =>
                                              sum + detail.hargaSatuan,
                                            0
                                          ) / item.detailStokMasuk.length
                                        ).toLocaleString("id-ID")}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"blue.600"}
                                      >
                                        Rp{" "}
                                        {item.detailStokMasuk
                                          .reduce(
                                            (sum, detail) =>
                                              sum +
                                              (Number(detail.stokAwal) || 0) *
                                                (Number(detail.hargaSatuan) ||
                                                  0),
                                            0
                                          )
                                          .toLocaleString("id-ID")}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"green.600"}
                                      >
                                        Rp{" "}
                                        {item.detailStokMasuk
                                          .reduce(
                                            (sum, detail) =>
                                              sum +
                                              (Number(detail.stokMasuk) || 0) *
                                                (Number(detail.hargaSatuan) ||
                                                  0),
                                            0
                                          )
                                          .toLocaleString("id-ID")}
                                      </Td>
                                      <Td fontWeight={"bold"} color={"red.600"}>
                                        Rp{" "}
                                        {item.detailStokMasuk
                                          .reduce(
                                            (sum, detail) =>
                                              sum +
                                              (Number(detail.stokKeluar) || 0) *
                                                (Number(detail.hargaSatuan) ||
                                                  0),
                                            0
                                          )
                                          .toLocaleString("id-ID")}
                                      </Td>
                                      <Td
                                        fontWeight={"bold"}
                                        color={"blue.600"}
                                      >
                                        Rp{" "}
                                        {item.detailStokMasuk
                                          .reduce((sum, detail) => {
                                            return (
                                              sum +
                                              (Number(detail.stokAkhir) || 0) *
                                                (Number(detail.hargaSatuan) ||
                                                  0)
                                            );
                                          }, 0)
                                          .toLocaleString("id-ID")}
                                      </Td>
                                      <Td></Td>
                                    </Tr>
                                  </>
                                );
                              } else {
                                return (
                                  <Tr key={`no-data-${item.persediaanId}`}>
                                    <Td
                                      colSpan={15}
                                      textAlign={"center"}
                                      color={"gray.500"}
                                    >
                                      Tidak ada detail transaksi stok masuk
                                      untuk {item.namaBarang}
                                    </Td>
                                  </Tr>
                                );
                              }
                            })}

                            {/* Baris GRAND TOTAL untuk seluruh barang pada kategori ini */}
                            <Tr bgColor={"gray.300"}>
                              <Td
                                colSpan={5}
                                fontWeight={"bold"}
                                textAlign={"center"}
                              >
                                GRAND TOTAL
                              </Td>
                              <Td fontWeight={"bold"} color={"gray.600"}>
                                {kategori.barang.reduce(
                                  (sumItem, item) =>
                                    sumItem +
                                    (item.detailStokMasuk
                                      ? item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokAwal) || 0),
                                          0
                                        )
                                      : 0),
                                  0
                                )}
                              </Td>
                              <Td fontWeight={"bold"} color={"green.600"}>
                                +
                                {kategori.barang.reduce(
                                  (sumItem, item) =>
                                    sumItem +
                                    (item.detailStokMasuk
                                      ? item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokMasuk) || 0),
                                          0
                                        )
                                      : 0),
                                  0
                                )}
                              </Td>
                              <Td fontWeight={"bold"} color={"red.600"}>
                                -
                                {kategori.barang.reduce(
                                  (sumItem, item) =>
                                    sumItem +
                                    (item.detailStokMasuk
                                      ? item.detailStokMasuk.reduce(
                                          (sum, detail) =>
                                            sum +
                                            (Number(detail.stokKeluar) || 0),
                                          0
                                        )
                                      : 0),
                                  0
                                )}
                              </Td>
                              <Td fontWeight={"bold"} color={"blue.600"}>
                                {kategori.barang.reduce(
                                  (sumItem, item) =>
                                    sumItem + (item.stokAkhir || 0),
                                  0
                                )}
                              </Td>
                              <Td fontWeight={"bold"} color={"green.600"}>
                                Rp{" "}
                                {(() => {
                                  const { totalHarga, count } =
                                    kategori.barang.reduce(
                                      (accItem, item) => {
                                        if (
                                          item.detailStokMasuk &&
                                          item.detailStokMasuk.length > 0
                                        ) {
                                          const subtotal =
                                            item.detailStokMasuk.reduce(
                                              (acc, d) => acc + d.hargaSatuan,
                                              0
                                            );
                                          return {
                                            totalHarga:
                                              accItem.totalHarga + subtotal,
                                            count:
                                              accItem.count +
                                              item.detailStokMasuk.length,
                                          };
                                        }
                                        return accItem;
                                      },
                                      { totalHarga: 0, count: 0 }
                                    );
                                  const avg =
                                    count > 0
                                      ? Math.round(totalHarga / count)
                                      : 0;
                                  return avg.toLocaleString("id-ID");
                                })()}
                              </Td>
                              <Td fontWeight={"bold"} color={"blue.600"}>
                                Rp{" "}
                                {kategori.barang
                                  .reduce(
                                    (sumItem, item) =>
                                      sumItem +
                                      (item.detailStokMasuk
                                        ? item.detailStokMasuk.reduce(
                                            (sum, d) =>
                                              sum +
                                              (Number(d.stokAwal) || 0) *
                                                (Number(d.hargaSatuan) || 0),
                                            0
                                          )
                                        : 0),
                                    0
                                  )
                                  .toLocaleString("id-ID")}
                              </Td>
                              <Td fontWeight={"bold"} color={"green.600"}>
                                Rp{" "}
                                {kategori.barang
                                  .reduce(
                                    (sumItem, item) =>
                                      sumItem +
                                      (item.detailStokMasuk
                                        ? item.detailStokMasuk.reduce(
                                            (sum, d) =>
                                              sum +
                                              (Number(d.stokMasuk) || 0) *
                                                (Number(d.hargaSatuan) || 0),
                                            0
                                          )
                                        : 0),
                                    0
                                  )
                                  .toLocaleString("id-ID")}
                              </Td>
                              <Td fontWeight={"bold"} color={"red.600"}>
                                Rp{" "}
                                {kategori.barang
                                  .reduce(
                                    (sumItem, item) =>
                                      sumItem +
                                      (item.detailStokMasuk
                                        ? item.detailStokMasuk.reduce(
                                            (sum, d) =>
                                              sum +
                                              (Number(d.stokKeluar) || 0) *
                                                (Number(d.hargaSatuan) || 0),
                                            0
                                          )
                                        : 0),
                                    0
                                  )
                                  .toLocaleString("id-ID")}
                              </Td>
                              <Td fontWeight={"bold"} color={"blue.600"}>
                                Rp{" "}
                                {kategori.barang
                                  .reduce(
                                    (sumItem, item) =>
                                      sumItem +
                                      (item.detailStokMasuk
                                        ? item.detailStokMasuk.reduce(
                                            (sum, d) => {
                                              return (
                                                sum +
                                                (Number(d.stokAkhir) || 0) *
                                                  (Number(d.hargaSatuan) || 0)
                                              );
                                            },
                                            0
                                          )
                                        : 0),
                                    0
                                  )
                                  .toLocaleString("id-ID")}
                              </Td>
                              <Td></Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Box>
                )}

                <Box
                  bgColor={"gray.100"}
                  p={"15px"}
                  borderRadius={"5px"}
                  borderLeft={"4px solid"}
                  borderLeftColor={"aset"}
                >
                  <SimpleGrid columns={4} spacing={4}>
                    <Box>
                      <Text fontSize={"14px"} color={"gray.600"}>
                        Total Stok Awal
                      </Text>
                      <Text fontSize={"16px"} fontWeight={"bold"}>
                        {kategori.total.stokAwal}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize={"14px"} color={"gray.600"}>
                        Total Masuk
                      </Text>
                      <Text
                        fontSize={"16px"}
                        fontWeight={"bold"}
                        color={"green.600"}
                      >
                        {kategori.total.masuk}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize={"14px"} color={"gray.600"}>
                        Total Keluar
                      </Text>
                      <Text
                        fontSize={"16px"}
                        fontWeight={"bold"}
                        color={"red.600"}
                      >
                        {kategori.total.keluar}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize={"14px"} color={"gray.600"}>
                        Total Stok Akhir
                      </Text>
                      <Text
                        fontSize={"16px"}
                        fontWeight={"bold"}
                        color={"blue.600"}
                      >
                        {kategori.total.stokAkhir}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                <Divider borderColor={"aset"} my={"50px"} />
              </Box>
            ))}
          </Container>
        </Box>
      </LayoutAset>
    </>
  );
}

export default RekapAdminAset;
