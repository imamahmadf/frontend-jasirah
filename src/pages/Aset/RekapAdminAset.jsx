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
  Stack,
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
          const totalMasuk =
            (Number(d.stokMasuk) || 0) + (Number(d.mutasiMasuk) || 0);
          const harga = Number(d.hargaSatuan) || 0;
          return sumDetail + totalMasuk * harga;
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
          const totalKeluar =
            (Number(d.stokKeluar) || 0) + (Number(d.mutasiKeluar) || 0);
          const harga = Number(d.hargaSatuan) || 0;
          return sumDetail + totalKeluar * harga;
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
                  nilaiAkhir,
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
              nilaiAkhir,
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
                const mutasiMasukQty = Number(detail.mutasiMasuk) || 0;
                const mutasiKeluarQty = Number(detail.mutasiKeluar) || 0;
                const totalMasukQty = stokMasuk + mutasiMasukQty;
                const totalKeluarQty = stokKeluar + mutasiKeluarQty;
                const stokAkhir = Number(detail.stokAkhir) || 0;
                const hargaSatuan = Number(detail.hargaSatuan) || 0;
                const saldoAwal = stokAwal * hargaSatuan;
                const nilaiMasuk = totalMasukQty * hargaSatuan;
                const nilaiKeluar = totalKeluarQty * hargaSatuan;
                const saldoAkhir = stokAkhir * hargaSatuan;

                grandTotalStokAwal += stokAwal;
                grandTotalStokMasuk += totalMasukQty;
                grandTotalStokKeluar += totalKeluarQty;
                grandTotalStokAkhir += stokAkhir;
                grandTotalSaldoAwal += saldoAwal;
                grandTotalMutasiMasuk += nilaiMasuk;
                grandTotalMutasiKeluar += nilaiKeluar;
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
                  totalMasukQty,
                  totalKeluarQty,
                  stokAkhir,
                  hargaSatuan,
                  saldoAwal,
                  nilaiMasuk,
                  nilaiKeluar,
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
        }/rekap-aset/get?laporanId=${props.match.params.id}`,
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

  const mobileField = (label, value) => (
    <Box mb={2}>
      <Text
        fontSize="xs"
        color="gray.500"
        fontWeight="semibold"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="sm">{value}</Text>
    </Box>
  );

  const renderMobileBarangCards = (kategori) => {
    const hasBreakdown = kategori.total?.berdasarkanSumberDana?.length > 0;

    if (!kategori.barang?.length) {
      return (
        <Text textAlign="center" color="gray.500" py={4}>
          Tidak ada data barang
        </Text>
      );
    }

    if (hasBreakdown) {
      const cards = kategori.total.berdasarkanSumberDana.flatMap(
        (sumberDana, sumberIndex) =>
          (sumberDana.detailPersediaan || []).map((detail, detailIndex) => (
            <Box
              key={`${sumberDana.id}-${detail.persediaanId}`}
              mb={3}
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              bg={colorMode === "dark" ? "gray.700" : "white"}
            >
              {mobileField("No.", `${sumberIndex + 1}.${detailIndex + 1}`)}
              {mobileField("Kode Barang", detail.kodeBarang)}
              {mobileField("Nama Barang", detail.namaBarang)}
              {mobileField(
                "Sumber Dana",
                <>
                  <Text fontWeight="bold" color="purple.600">
                    {sumberDana.nama}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    ID: {sumberDana.id}
                  </Text>
                </>,
              )}
              {mobileField("Stok Akhir", detail.sisaStok)}
              {mobileField(
                "Nilai Akhir Aset",
                <Text fontWeight="bold" color="blue.600">
                  Rp {detail.nilaiStok.toLocaleString("id-ID")}
                </Text>,
              )}
            </Box>
          )),
      );

      const totalStok = kategori.total.berdasarkanSumberDana.reduce(
        (sum, sd) =>
          sum +
          (sd.detailPersediaan
            ? sd.detailPersediaan.reduce((s, d) => s + d.sisaStok, 0)
            : 0),
        0,
      );
      const totalNilai = kategori.total.berdasarkanSumberDana.reduce(
        (sum, sd) =>
          sum +
          (sd.detailPersediaan
            ? sd.detailPersediaan.reduce((s, d) => s + d.nilaiStok, 0)
            : 0),
        0,
      );

      return (
        <>
          {cards}
          <Box
            p={3}
            bg="gray.100"
            borderRadius="md"
            textAlign="center"
            fontWeight="bold"
          >
            <Text>TOTAL</Text>
            <HStack justify="space-around" mt={2}>
              <Text color="blue.600">Stok: {totalStok}</Text>
              <Text color="blue.600">
                Rp {totalNilai.toLocaleString("id-ID")}
              </Text>
            </HStack>
          </Box>
        </>
      );
    }

    return (
      <>
        {kategori.barang.map((item, barangIndex) => (
          <Box
            key={item.persediaanId}
            mb={3}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            bg={colorMode === "dark" ? "gray.700" : "white"}
          >
            {mobileField("No.", barangIndex + 1)}
            {mobileField(
              "Kode Barang",
              item.kodeBarangGabungan || item.kodeBarang,
            )}
            {mobileField("Nama Barang", item.namaBarang)}
            {mobileField(
              "Sumber Dana",
              item.sumberDana?.length > 0 ? (
                <>
                  <Text fontWeight="bold">{item.sumberDana[0]?.sumber}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {item.sumberDana[0]?.untukPembayaran}
                  </Text>
                </>
              ) : (
                "-"
              ),
            )}
            {mobileField("Stok Akhir", item.stokAkhir)}
            {mobileField(
              "Nilai Akhir Aset",
              item.rataRataHargaSatuan && item.stokAkhir ? (
                <Text fontWeight="bold" color="blue.600">
                  Rp{" "}
                  {(item.rataRataHargaSatuan * item.stokAkhir).toLocaleString(
                    "id-ID",
                  )}
                </Text>
              ) : (
                "-"
              ),
            )}
          </Box>
        ))}
        <Box
          p={3}
          bg="gray.100"
          borderRadius="md"
          textAlign="center"
          fontWeight="bold"
        >
          <Text>TOTAL</Text>
          <HStack justify="space-around" mt={2}>
            <Text color="blue.600">
              Stok:{" "}
              {kategori.barang.reduce((s, i) => s + (i.stokAkhir || 0), 0)}
            </Text>
            <Text color="blue.600">
              Rp{" "}
              {kategori.barang
                .reduce(
                  (s, i) =>
                    s +
                    (i.rataRataHargaSatuan && i.stokAkhir
                      ? i.rataRataHargaSatuan * i.stokAkhir
                      : 0),
                  0,
                )
                .toLocaleString("id-ID")}
            </Text>
          </HStack>
        </Box>
      </>
    );
  };

  const renderMobileDetailTransaksi = (kategori) => {
    if (!kategori.barang?.length) return null;

    return kategori.barang.map((item) => {
      if (!item.detailStokMasuk?.length) {
        return (
          <Box
            key={`no-detail-${item.persediaanId}`}
            p={3}
            mb={3}
            borderRadius="md"
            bg="gray.50"
          >
            <Text fontWeight="bold" fontSize="sm" mb={1}>
              {item.namaBarang}
            </Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Tidak ada detail transaksi
            </Text>
          </Box>
        );
      }

      return (
        <Box key={item.persediaanId} mb={4}>
          <Box
            bg="gray.200"
            p={3}
            borderRadius="md"
            mb={2}
            fontWeight="bold"
            fontSize="sm"
          >
            {item.namaBarang} ({item.kodeBarangGabungan || item.kodeBarang})
          </Box>
          {item.detailStokMasuk.map((detail, detailIndex) => {
            const stokAwal = Number(detail.stokAwal) || 0;
            const stokMasuk = Number(detail.stokMasuk) || 0;
            const stokKeluar = Number(detail.stokKeluar) || 0;
            const mutasiMasukQty = Number(detail.mutasiMasuk) || 0;
            const mutasiKeluarQty = Number(detail.mutasiKeluar) || 0;
            const totalMasukQty = stokMasuk + mutasiMasukQty;
            const totalKeluarQty = stokKeluar + mutasiKeluarQty;
            const stokAkhir = Number(detail.stokAkhir) || 0;
            const hargaSatuan = Number(detail.hargaSatuan) || 0;

            return (
              <Box
                key={detail.id}
                mb={2}
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                bg={colorMode === "dark" ? "gray.700" : "white"}
              >
                <Text fontWeight="bold" fontSize="xs" color="aset" mb={2}>
                  #{detailIndex + 1}
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  {mobileField(
                    "Tanggal",
                    detail.tanggal
                      ? new Date(detail.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-",
                  )}
                  {mobileField(
                    "Unit Kerja",
                    detail.unitKerja?.unitKerja || "-",
                  )}
                  {mobileField("Sumber Dana", detail.sumberDana?.sumber || "-")}
                  {mobileField("Spesifikasi", detail.spesifikasi || "-")}
                  {mobileField("Stok Awal", stokAwal)}
                  {mobileField(
                    "Stok Masuk",
                    totalMasukQty > 0 ? (
                      <Text
                        color={detail.isMutasi ? "purple.600" : "green.600"}
                        fontWeight="bold"
                      >
                        +{totalMasukQty}
                        {detail.isMutasi ? " (mutasi)" : ""}
                      </Text>
                    ) : (
                      "-"
                    ),
                  )}
                  {mobileField(
                    "Stok Keluar",
                    totalKeluarQty > 0 ? (
                      <Text color="red.600" fontWeight="bold">
                        -{totalKeluarQty}
                        {mutasiKeluarQty > 0 && stokKeluar === 0
                          ? " (mutasi)"
                          : ""}
                      </Text>
                    ) : (
                      "-"
                    ),
                  )}
                  {mobileField(
                    "Stok Akhir",
                    <Text color="blue.600" fontWeight="bold">
                      {stokAkhir}
                    </Text>,
                  )}
                  {mobileField(
                    "Harga Satuan",
                    `Rp ${hargaSatuan.toLocaleString("id-ID")}`,
                  )}
                  {mobileField(
                    "Saldo Akhir",
                    <Text color="blue.600" fontWeight="bold">
                      Rp {(stokAkhir * hargaSatuan).toLocaleString("id-ID")}
                    </Text>,
                  )}
                </SimpleGrid>
                {detail.keterangan &&
                  mobileField("Keterangan", detail.keterangan)}
              </Box>
            );
          })}
        </Box>
      );
    });
  };

  return (
    <>
      <LayoutAset>
        <Box
          bgColor={"secondary"}
          pb={"40px"}
          px={{ base: "12px", md: "30px" }}
        >
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={{ base: "16px", md: "30px" }}
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
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
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

            <Stack
              mb={"20px"}
              direction={{ base: "column", sm: "row" }}
              spacing={3}
              align={{ base: "stretch", sm: "flex-end" }}
              justify="flex-end"
            >
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
            </Stack>

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

                <Box display={{ base: "block", md: "none" }} mb="20px">
                  {renderMobileBarangCards(kategori)}
                </Box>

                <Box display={{ base: "none", md: "block" }} overflowX="auto">
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
                                                "id-ID",
                                              )}
                                            </Text>
                                          </Td>
                                        </Tr>
                                      ),
                                    )
                                  : [],
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
                                          0,
                                        )
                                      : 0),
                                  0,
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
                                            0,
                                          )
                                        : 0),
                                    0,
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
                                      <Text
                                        fontSize={"12px"}
                                        color={"gray.600"}
                                      >
                                        {item.sumberDana[0]?.untukPembayaran}
                                      </Text>
                                    </Box>
                                  ) : (
                                    <Text color={"gray.400"}>-</Text>
                                  )}
                                </Td>
                                <Td>{item.stokAkhir}</Td>
                                <Td>
                                  {item.rataRataHargaSatuan &&
                                  item.stokAkhir ? (
                                    <Text
                                      fontWeight={"bold"}
                                      color={"blue.600"}
                                    >
                                      Rp{" "}
                                      {(
                                        item.rataRataHargaSatuan *
                                        item.stokAkhir
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
                                  0,
                                )}
                              </Td>
                              <Td fontWeight={"bold"} color={"blue.600"}>
                                Rp{" "}
                                {kategori.barang
                                  .reduce(
                                    (sum, item) =>
                                      sum +
                                      (item.rataRataHargaSatuan &&
                                      item.stokAkhir
                                        ? item.rataRataHargaSatuan *
                                          item.stokAkhir
                                        : 0),
                                    0,
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
                </Box>

                {kategori.barang && kategori.barang.length > 0 && (
                  <Box mb={"30px"}>
                    <Stack
                      mb={"20px"}
                      direction={{ base: "column", sm: "row" }}
                      justify={"space-between"}
                      align={{ base: "stretch", sm: "center" }}
                      spacing={3}
                    >
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
                    </Stack>

                    {showDetailTable[kategori.id] && (
                      <>
                        <Box display={{ base: "block", md: "none" }} mb="20px">
                          {renderMobileDetailTransaksi(kategori)}
                        </Box>
                        <Box
                          display={{ base: "none", md: "block" }}
                          ml={{ base: 0, md: "40px" }}
                          overflowX="auto"
                        >
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
                                    <React.Fragment key={item.persediaanId}>
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
                                          const mutasiMasukQty =
                                            Number(detail.mutasiMasuk) || 0;
                                          const mutasiKeluarQty =
                                            Number(detail.mutasiKeluar) || 0;
                                          const totalMasukQty =
                                            stokMasuk + mutasiMasukQty;
                                          const totalKeluarQty =
                                            stokKeluar + mutasiKeluarQty;
                                          const stokAkhir =
                                            Number(detail.stokAkhir) || 0;
                                        const hargaSatuan =
                                          Number(detail.hargaSatuan) || 0;
                                        const nilaiMasuk =
                                          totalMasukQty * hargaSatuan;
                                        const nilaiKeluar =
                                          totalKeluarQty * hargaSatuan;

                                        return (
                                            <Tr key={detail.id}>
                                              <Td>{detailIndex + 1}</Td>
                                              <Td>
                                                {detail.tanggal
                                                  ? new Date(
                                                      detail.tanggal,
                                                    ).toLocaleDateString(
                                                      "id-ID",
                                                      {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                      },
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
                                                      {
                                                        detail.unitKerja
                                                          .unitKerja
                                                      }
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
                                              <Td>
                                                {detail.spesifikasi || "-"}
                                              </Td>
                                              <Td>
                                                <Text
                                                  fontWeight={"bold"}
                                                  color={"gray.600"}
                                                >
                                                  {stokAwal}
                                                </Text>
                                              </Td>
                                              <Td>
                                                {totalMasukQty > 0 ? (
                                                  <Text
                                                    fontWeight={"bold"}
                                                    color={
                                                      detail.isMutasi
                                                        ? "purple.600"
                                                        : "green.600"
                                                    }
                                                  >
                                                    +{totalMasukQty}
                                                    {detail.isMutasi
                                                      ? " (mutasi)"
                                                      : ""}
                                                  </Text>
                                                ) : (
                                                  <Text color={"gray.400"}>
                                                    -
                                                  </Text>
                                                )}
                                              </Td>
                                              <Td>
                                                {totalKeluarQty > 0 ? (
                                                  <Text
                                                    fontWeight={"bold"}
                                                    color={"red.600"}
                                                  >
                                                    -{totalKeluarQty}
                                                    {mutasiKeluarQty > 0 &&
                                                    stokKeluar === 0
                                                      ? " (mutasi)"
                                                      : ""}
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
                                                  {hargaSatuan.toLocaleString(
                                                    "id-ID",
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
                                                    stokAwal * hargaSatuan
                                                  ).toLocaleString("id-ID")}
                                                </Text>
                                              </Td>
                                              <Td>
                                                {nilaiMasuk > 0 ? (
                                                  <Text
                                                    fontWeight={"bold"}
                                                    color={"green.600"}
                                                  >
                                                    Rp{" "}
                                                    {nilaiMasuk.toLocaleString(
                                                      "id-ID",
                                                    )}
                                                  </Text>
                                                ) : (
                                                  <Text color={"gray.400"}>
                                                    -
                                                  </Text>
                                                )}
                                              </Td>
                                              <Td>
                                                {nilaiKeluar > 0 ? (
                                                  <Text
                                                    fontWeight={"bold"}
                                                    color={"red.600"}
                                                  >
                                                    Rp{" "}
                                                    {nilaiKeluar.toLocaleString(
                                                      "id-ID",
                                                    )}
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
                                                  Rp{" "}
                                                  {(
                                                    stokAkhir * hargaSatuan
                                                  ).toLocaleString("id-ID")}
                                                </Text>
                                              </Td>
                                              <Td>
                                                {detail.keterangan || "-"}
                                              </Td>
                                            </Tr>
                                          );
                                        },
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
                                            0,
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
                                              (Number(detail.stokMasuk) || 0) +
                                              (Number(detail.mutasiMasuk) || 0),
                                            0,
                                          )}
                                        </Td>
                                        <Td
                                          fontWeight={"bold"}
                                          color={"red.600"}
                                        >
                                          -
                                          {item.detailStokMasuk.reduce(
                                            (sum, detail) =>
                                              sum +
                                              (Number(detail.stokKeluar) || 0) +
                                              (Number(detail.mutasiKeluar) ||
                                                0),
                                            0,
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
                                            0,
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
                                              0,
                                            ) / item.detailStokMasuk.length,
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
                                              0,
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
                                                ((Number(detail.stokMasuk) ||
                                                  0) +
                                                  (Number(detail.mutasiMasuk) ||
                                                    0)) *
                                                  (Number(detail.hargaSatuan) ||
                                                    0),
                                              0,
                                            )
                                            .toLocaleString("id-ID")}
                                        </Td>
                                        <Td
                                          fontWeight={"bold"}
                                          color={"red.600"}
                                        >
                                          Rp{" "}
                                          {item.detailStokMasuk
                                            .reduce(
                                              (sum, detail) =>
                                                sum +
                                                ((Number(detail.stokKeluar) ||
                                                  0) +
                                                  (Number(
                                                    detail.mutasiKeluar,
                                                  ) || 0)) *
                                                  (Number(detail.hargaSatuan) ||
                                                    0),
                                              0,
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
                                                (Number(detail.stokAkhir) ||
                                                  0) *
                                                  (Number(detail.hargaSatuan) ||
                                                    0)
                                              );
                                            }, 0)
                                            .toLocaleString("id-ID")}
                                        </Td>
                                        <Td></Td>
                                      </Tr>
                                    </React.Fragment>
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
                                            0,
                                          )
                                        : 0),
                                    0,
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
                                              (Number(detail.stokMasuk) || 0) +
                                              (Number(detail.mutasiMasuk) || 0),
                                            0,
                                          )
                                        : 0),
                                    0,
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
                                              (Number(detail.stokKeluar) || 0) +
                                              (Number(detail.mutasiKeluar) ||
                                                0),
                                            0,
                                          )
                                        : 0),
                                    0,
                                  )}
                                </Td>
                                <Td fontWeight={"bold"} color={"blue.600"}>
                                  {kategori.barang.reduce(
                                    (sumItem, item) =>
                                      sumItem + (item.stokAkhir || 0),
                                    0,
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
                                                0,
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
                                        { totalHarga: 0, count: 0 },
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
                                              0,
                                            )
                                          : 0),
                                      0,
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
                                              ((Number(d.stokMasuk) || 0) +
                                                (Number(d.mutasiMasuk) || 0)) *
                                                (Number(d.hargaSatuan) || 0),
                                            0,
                                          )
                                        : 0),
                                    0,
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
                                              ((Number(d.stokKeluar) || 0) +
                                                (Number(d.mutasiKeluar) || 0)) *
                                                (Number(d.hargaSatuan) || 0),
                                            0,
                                          )
                                        : 0),
                                    0,
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
                                              0,
                                            )
                                          : 0),
                                      0,
                                    )
                                    .toLocaleString("id-ID")}
                                </Td>
                                <Td></Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </Box>
                      </>
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
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
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
