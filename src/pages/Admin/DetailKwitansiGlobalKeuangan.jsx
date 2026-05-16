import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import { BsCartDash } from "react-icons/bs";

import { BsClipboard2Data } from "react-icons/bs";
import { BsLock } from "react-icons/bs";
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
  Checkbox,
  Badge,
  VStack,
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
import { BsCartPlus } from "react-icons/bs";
function DetailKwitansiGlobalKeuangan(props) {
  const [dataKwitGlobal, setDataKwitGlobal] = useState([]);
  const history = useHistory();
  const [isPrinting, setIsPrinting] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const user = useSelector(userRedux);

  async function fetchKwitansiGlobal() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/get/detail/${props.match.params.id}`
      )
      .then((res) => {
        setDataKwitGlobal(res.data.result);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const tolak = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/tolak/${props.match.params.id}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const verifikasi = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/verifikasi/${props.match.params.id}`
      )
      .then((res) => {
        console.log(res.status, res.data, "verifikasi berhasil");
        toast({
          title: "Berhasil!",
          description: "Verifikasi berhasil dilakukan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchKwitansiGlobal();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Gagal melakukan verifikasi",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const kirimDataTabel = () => {
    const kg = Array.isArray(dataKwitGlobal)
      ? dataKwitGlobal[0]
      : dataKwitGlobal;
    if (!kg) {
      toast({
        title: "Error!",
        description: "Data belum tersedia",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const perjalanans = Array.isArray(kg.perjalanans) ? kg.perjalanans : [];
    const parseNumber = (val) => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const cleaned = val.replace(/[^0-9.-]/g, "");
        const num = Number(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    const formatTanggalList = (tempats = []) =>
      tempats
        .map((t) => t?.tanggalBerangkat)
        .filter(Boolean)
        .map((d) => new Date(d))
        .map((d) => (isNaN(d) ? null : d))
        .filter(Boolean)
        .map((d) => d.toLocaleDateString("id-ID"))
        .join(", ");

    const formatTempatList = (tempats = []) =>
      tempats
        .map((t) => {
          const tempatStr = t?.tempat || "";
          if (tempatStr.toLowerCase() === "dalam kota") {
            return t?.dalamKota?.nama || "Dalam Kota";
          }
          return tempatStr;
        })
        .filter(Boolean)
        .join(", ");

    const dataTabel = perjalanans.flatMap((perj) => {
      const personils = Array.isArray(perj.personils) ? perj.personils : [];
      const tanggalStr = formatTanggalList(perj.tempats || []);
      const tempatStr = formatTempatList(perj.tempats || []);

      return personils.map((p, index) => {
        const subtotal = (p.rincianBPDs || []).reduce((acc, r) => {
          const nilai = parseNumber(r?.nilai);
          const qty = r?.qty == null ? 1 : parseNumber(r?.qty);
          return acc + nilai * qty;
        }, 0);

        return {
          no: 1 + index,
          nama: p.pegawai?.nama || "-",
          BPD: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(subtotal),
          subtotal: subtotal, // Simpan nilai numerik untuk perhitungan totalFE
          tujuan: tempatStr || "-",
          tanggal: tanggalStr || "-",
          noSuratTugas: perj.noSuratTugas || "-",
          kegiatan: perj.untuk || "-",
        };
      });
    });

    if (dataTabel.length === 0) {
      toast({
        title: "Error!",
        description: "Tidak ada data untuk dikirim",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(dataTabel);

    // Hitung totalFE dari semua subtotal dalam dataTabel
    const totalFE = dataTabel.reduce((total, item) => {
      return total + (item.subtotal || 0);
    }, 0);
    setIsPrinting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi-global/post/cetak`,
        {
          data: dataTabel,
          kwitansiGlobalId: props.match.params.id,
          templateId: dataKwitGlobal[0]?.templateKwitGlobalId,
          subKegiatan: dataKwitGlobal[0]?.subKegiatan,
          KPAFE: dataKwitGlobal[0]?.KPA,
          bendaharaFE: dataKwitGlobal[0]?.bendahara,
          penerima: dataKwitGlobal[0]?.pegawai,
          jenisPerjalananFE: dataKwitGlobal[0]?.jenisPerjalanan,
          totalFE,
          indukUnitKerjaFE:
            user[0]?.unitKerja_profile.indukUnitKerja.indukUnitKerja,
        },
        {
          responseType: "blob", // Penting untuk file binary
          headers: {
            "Content-Type": "application/json",
            Accept:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        }
      )
      .then((res) => {
        // Buat blob dengan MIME type yang tepat
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `kuitansi_global_${
            props.match.params.id
          }_${new Date().getTime()}.docx`
        );
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        toast({
          title: "Berhasil!",
          description: "File berhasil diunduh.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsPrinting(false);
      })
      .catch((err) => {
        console.error("Error mengirim data:", err);
        toast({
          title: "Error!",
          description: "Gagal mengirim data ke API",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsPrinting(false);
      });
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "gray";
      case 2:
        return "blue";
      case 3:
        return "green";
      case 4:
        return "red";
      case 5:
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "SPD dan Surat Tugas Sudah dibuat";
      case 2:
        return "Pengajuan kuitansi";
      case 3:
        return "Kwitansi tervierifikasi";
      case 4:
        return "Kwitansi ditolak";
      case 5:
        return "Selesai";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    fetchKwitansiGlobal();
  }, [page]);
  return (
    <>
      <Layout>
        <Box minH={"70vh"} bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            maxW={"3280px"}
            p={"30px"}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            {/* {JSON.stringify(dataKwitGlobal[0]?.perjalanans[0])} */}

            <HStack gap={5} mb={"30px"}>
              <Spacer />
            </HStack>

            {/* Section Data Detail Kwitansi Global */}
            {(() => {
              const kg = Array.isArray(dataKwitGlobal)
                ? dataKwitGlobal[0]
                : dataKwitGlobal;
              if (!kg) {
                return <Text color="gray.500">Data belum tersedia</Text>;
              }

              return (
                <Box mb={"30px"}>
                  <Flex align="center" mb={"20px"}>
                    <Heading size="lg" color="primary">
                      Detail Kwitansi Global
                    </Heading>
                    <Spacer />
                    <Box>
                      <Box
                        position="absolute"
                        top="-50px"
                        right="-50px"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        bg="white"
                        opacity="0.1"
                      />
                      <Flex align="center" mb={4}>
                        <Box
                          p={2}
                          borderRadius="full"
                          bg="white"
                          color="pink.500"
                          mr={3}
                        ></Box>
                        <Text fontWeight="bold" fontSize="lg"></Text>{" "}
                        <VStack align="center" spacing={3}>
                          <Badge
                            colorScheme={
                              kg.status === "diajukan" ? "blue" : "gray"
                            }
                            size="lg"
                            px={6}
                            py={3}
                            borderRadius="full"
                            fontSize="lg"
                            fontWeight="bold"
                          >
                            Status: {kg.status}
                          </Badge>
                        </VStack>
                      </Flex>
                    </Box>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    {/* Data KPA */}
                    <Box
                      p={6}
                      borderRadius="xl"
                      bg="gradient-to-r"
                      bgGradient="linear(to-r, green.400, blue.500)"
                      color="white"
                      boxShadow="xl"
                      transition="all 0.3s ease"
                      _hover={{
                        boxShadow: "2xl",
                        transform: "translateY(-4px)",
                        borderColor: "green.300",
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top="-50px"
                        right="-50px"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        bg="white"
                        opacity="0.1"
                      />
                      <Flex align="center" mb={4}>
                        <Text fontWeight="bold" fontSize="lg">
                          {kg.KPA?.jabatan}
                        </Text>
                      </Flex>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="md" fontWeight="semibold"></Text>
                        <Text fontSize="lg" fontWeight="bold">
                          {kg.KPA?.pegawai_KPA?.nama || "-"}
                        </Text>
                        <Text fontSize="sm" opacity="0.9">
                          NIP: {kg.KPA?.pegawai_KPA?.nip || "-"}
                        </Text>
                      </VStack>
                    </Box>

                    {/* Data Bendahara */}
                    <Box
                      p={6}
                      borderRadius="xl"
                      bg="gradient-to-r"
                      bgGradient="linear(to-r, green.400, blue.500)"
                      color="white"
                      boxShadow="xl"
                      transition="all 0.3s ease"
                      _hover={{
                        boxShadow: "2xl",
                        transform: "translateY(-4px)",
                        borderColor: "green.300",
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top="-50px"
                        right="-50px"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        bg="white"
                        opacity="0.1"
                      />
                      <Flex align="center" mb={4}>
                        <Text fontWeight="bold" fontSize="lg">
                          {kg.bendahara?.jabatan}
                        </Text>
                      </Flex>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="lg" fontWeight="bold">
                          {kg.bendahara?.pegawai_bendahara?.nama || "-"}
                        </Text>
                        <Text fontSize="sm" opacity="0.9">
                          NIP: {kg.bendahara?.pegawai_bendahara?.nip || "-"}
                        </Text>
                      </VStack>
                    </Box>

                    {/* Data Pegawai */}
                    <Box
                      p={6}
                      borderRadius="xl"
                      bg="gradient-to-r"
                      bgGradient="linear(to-r, green.400, blue.500)"
                      color="white"
                      boxShadow="xl"
                      transition="all 0.3s ease"
                      _hover={{
                        boxShadow: "2xl",
                        transform: "translateY(-4px)",
                        borderColor: "green.300",
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top="-50px"
                        right="-50px"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        bg="white"
                        opacity="0.1"
                      />
                      <Flex align="center" mb={4}>
                        <Text fontWeight="bold" fontSize="lg">
                          Data Pegawai
                        </Text>
                      </Flex>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="lg" fontWeight="bold">
                          {kg.pegawai?.nama}
                        </Text>
                        <Text fontSize="sm" opacity="0.9">
                          NIP: {kg.pegawai?.nip}
                        </Text>
                      </VStack>
                    </Box>

                    {/* Data Jenis Perjalanan dan Sub Kegiatan */}
                    <Box
                      p={6}
                      borderRadius="xl"
                      bg="gradient-to-r"
                      bgGradient="linear(to-r, green.400, blue.500)"
                      color="white"
                      boxShadow="xl"
                      transition="all 0.3s ease"
                      _hover={{
                        boxShadow: "2xl",
                        transform: "translateY(-4px)",
                        borderColor: "green.300",
                      }}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top="-50px"
                        right="-50px"
                        width="100px"
                        height="100px"
                        borderRadius="50%"
                        bg="white"
                        opacity="0.1"
                      />
                      <Flex align="center" mb={4}>
                        <Text fontWeight="bold" fontSize="lg">
                          Informasi Perjalanan
                        </Text>
                      </Flex>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={1}>
                            Jenis Perjalanan: {kg.jenisPerjalanan?.jenis}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={1}>
                            Sub Kegiatan: {kg.subKegiatan?.subKegiatan}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={1}>
                            Kode Rekening : {kg.subKegiatan?.kodeRekening}
                            {kg.jenisPerjalanan?.kodeRekening}
                          </Text>
                          <Text
                            fontSize="sm"
                            opacity="0.9"
                            fontFamily="mono"
                          ></Text>
                        </Box>
                      </VStack>
                    </Box>

                    {/* Data Status */}
                  </SimpleGrid>
                </Box>
              );
            })()}

            {(() => {
              const kg = Array.isArray(dataKwitGlobal)
                ? dataKwitGlobal[0]
                : dataKwitGlobal;
              if (!kg) {
                return <Text color="gray.500">Data belum tersedia</Text>;
              }
              const perjalanans = Array.isArray(kg.perjalanans)
                ? kg.perjalanans
                : [];
              const parseNumber = (val) => {
                if (typeof val === "number") return val;
                if (typeof val === "string") {
                  const cleaned = val.replace(/[^0-9.-]/g, "");
                  const num = Number(cleaned);
                  return isNaN(num) ? 0 : num;
                }
                return 0;
              };
              const formatTanggalList = (tempats = []) =>
                tempats
                  .map((t) => t?.tanggalBerangkat)
                  .filter(Boolean)
                  .map((d) => new Date(d))
                  .map((d) => (isNaN(d) ? null : d))
                  .filter(Boolean)
                  .map((d) => d.toLocaleDateString("id-ID"))
                  .join(", ");
              const formatTempatList = (tempats = []) =>
                tempats
                  .map((t) => {
                    const tempatStr = t?.tempat || "";
                    if (tempatStr.toLowerCase() === "dalam kota") {
                      return t?.dalamKota?.nama || "Dalam Kota";
                    }
                    return tempatStr;
                  })
                  .filter(Boolean)
                  .join(", ");
              const rows = perjalanans.flatMap((perj) => {
                const personils = Array.isArray(perj.personils)
                  ? perj.personils
                  : [];
                const tanggalStr = formatTanggalList(perj.tempats || []);
                const tempatStr = formatTempatList(perj.tempats || []);
                return personils.map((p) => {
                  const subtotal = (p.rincianBPDs || []).reduce((acc, r) => {
                    const nilai = parseNumber(r?.nilai);
                    const qty = r?.qty == null ? 1 : parseNumber(r?.qty);
                    return acc + nilai * qty;
                  }, 0);

                  return {
                    noSuratTugas: perj.noSuratTugas || "-",
                    tanggalBerangkat: tanggalStr || "-",
                    tempat: tempatStr || "-",
                    total: subtotal,
                    nama: p.pegawai?.nama || "-",
                    status: p.status.statusKuitansi,
                    statusId: p.statusId || p.status?.id,
                    id: perj.id,
                  };
                });
              });
              if (rows.length === 0) {
                return <Text color="gray.500">Tidak ada data perjalanan</Text>;
              }
              const totalAll = rows.reduce((a, r) => a + (r.total || 0), 0);
              return (
                <Table variant="primary" size="sm">
                  <Thead>
                    <Tr>
                      <Th>No Surat Tugas</Th> <Th>Nama Pegawai</Th>
                      <Th>Tanggal Berangkat</Th>
                      <Th>Tempat</Th> <Th>Status</Th>
                      <Th isNumeric>BPD</Th>
                      <Th>Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.map((r, idx) => (
                      <Tr key={idx}>
                        <Td>{r.noSuratTugas}</Td> <Td>{r.nama}</Td>
                        <Td>{r.tanggalBerangkat}</Td>
                        <Td>{r.tempat}</Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(r.statusId)}
                            size="md"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {getStatusText(r.statusId)}
                          </Badge>
                        </Td>
                        <Td isNumeric>Rp {r.total.toLocaleString("id-ID")}</Td>
                        <Td>
                          <Button
                            onClick={() =>
                              history.push(`/admin/rampung/${r.id}`)
                            }
                          >
                            detail
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                    <Tr>
                      <Td colSpan={5} fontWeight="bold">
                        TOTAL
                      </Td>
                      <Td colSpan={2} isNumeric fontWeight="bold">
                        Rp {totalAll.toLocaleString("id-ID")}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              );
            })()}

            {/* Logika untuk tombol berdasarkan status */}
            {(() => {
              const kg = Array.isArray(dataKwitGlobal)
                ? dataKwitGlobal[0]
                : dataKwitGlobal;
              if (!kg) return null;

              const perjalanans = Array.isArray(kg.perjalanans)
                ? kg.perjalanans
                : [];

              // Cek apakah semua statusId === 3 (Diverifikasi)
              const allStatusVerified = perjalanans.every((perj) => {
                const personils = Array.isArray(perj.personils)
                  ? perj.personils
                  : [];
                return personils.every((personil) => {
                  const statusId = personil.statusId || personil.status?.id;
                  return statusId === 3;
                });
              });

              // Jika status kwitansi global adalah "dibuat", tampilkan tombol Ajukan
              // if (kg.status === "dibuat") {
              //   return (
              //     <Button mt={"30px"} variant={"primary"} onClick={ajukan}>
              //       Ajukan
              //     </Button>
              //   );
              // }

              // Jika semua status sudah diverifikasi (statusId === 3), tampilkan tombol Verifikasi
              if (allStatusVerified && kg.status === "diajukan") {
                return (
                  <Button mt={"30px"} variant={"primary"} onClick={verifikasi}>
                    Verifikasi
                  </Button>
                );
              }

              return null;
            })()}
            <Button mt={"30px"} variant={"primary"} onClick={tolak}>
              Tolak
            </Button>
          </Container>
        </Box>

        {/* Modal Detail Kwitansi Global */}
      </Layout>
    </>
  );
}

export default DetailKwitansiGlobalKeuangan;
