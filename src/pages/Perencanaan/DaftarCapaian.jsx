import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
  VStack,
  useColorMode,
  useToast,
  Button,
  Flex,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import { Link, useHistory } from "react-router-dom";
import {
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBuilding,
  FaTag,
  FaUser,
} from "react-icons/fa";

function DaftarCapaian() {
  const [dataCapaian, setDataCapaian] = useState([]);
  const { colorMode } = useColorMode();
  const history = useHistory();
  const user = useSelector(userRedux);
  const toast = useToast();
  const [loadingRowId, setLoadingRowId] = useState(null);

  // Fungsi untuk format rupiah
  const formatRupiah = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Fungsi untuk mendapatkan nama bulan
  const getNamaBulan = (bulan) => {
    const bulanList = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return bulanList[bulan - 1] || bulan;
  };
  async function fetchCapaian() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/capaian/get/all-capaian/${user[0]?.unitKerja_profile?.id}`
      );
      // Pastikan data selalu berupa array
      const data = res.data;
      if (Array.isArray(data)) {
        setDataCapaian(data);
      } else if (data && Array.isArray(data.result)) {
        setDataCapaian(data.result);
      } else {
        setDataCapaian([]);
      }
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setDataCapaian([]); // Set ke array kosong jika error
    }
  }

  useEffect(() => {
    fetchCapaian();
  }, []);

  async function updateCapaianStatus(capaianItem, statusBaru) {
    try {
      setLoadingRowId(capaianItem?.id);
      const payload = { ...capaianItem, status: statusBaru };
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/capaian/update/${
          capaianItem?.id
        }`,
        payload
      );
      setDataCapaian((prev) =>
        prev.map((target) => ({
          ...target,
          capaians: Array.isArray(target?.capaians)
            ? target.capaians.map((c) =>
                c.id === capaianItem.id ? { ...c, status: statusBaru } : c
              )
            : target?.capaians,
        }))
      );
      toast({
        title: "Status diperbarui",
        description: `Status capaian diubah ke ${statusBaru}`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal memperbarui",
        description: "Terjadi kesalahan saat mengirim ke server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingRowId(null);
    }
  }

  return (
    <LayoutPerencanaan>
      <Box
        bgGradient={
          colorMode === "dark"
            ? "linear(to-b, gray.800, gray.900)"
            : "linear(to-b, blue.50, gray.50)"
        }
        minH="100vh"
        py={{ base: 6, md: 8 }}
        px={{ base: 4, md: 6, lg: 8 }}
        w="100%"
      >
        <Box w="100%" maxW="1280px" mx="auto">
          <Heading
            size="lg"
            mb={6}
            color={colorMode === "dark" ? "white" : "gray.800"}
          >
            Daftar Capaian
          </Heading>
          {!Array.isArray(dataCapaian) || dataCapaian.length === 0 ? (
            <Box
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="xl"
              p={8}
              textAlign="center"
              boxShadow="lg"
            >
              <Text color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                Tidak ada data capaian.
              </Text>
            </Box>
          ) : (
            <Accordion allowMultiple>
              {dataCapaian.map((item) => {
                const indikatorNama = item?.indikator?.indikator || "-";
                const capaians = Array.isArray(item?.capaians)
                  ? [...item.capaians].sort(
                      (a, b) => (a?.bulan || 0) - (b?.bulan || 0)
                    )
                  : [];

                // Ambil tahun anggaran dengan prioritas: perubahan > murni
                const anggaranMurni = item?.tahunAnggarans?.find(
                  (ta) => ta.jenisAnggaranId === 1
                );
                const anggaranPerubahan = item?.tahunAnggarans?.find(
                  (ta) => ta.jenisAnggaranId === 2
                );
                const tahunAnggaranAktif = anggaranPerubahan || anggaranMurni;
                const tahunAnggaran = tahunAnggaranAktif?.tahun;
                const jenisAnggaran = tahunAnggaranAktif?.jenisAnggaran?.jenis;
                const anggaran = tahunAnggaranAktif?.anggaran;

                const hasPengajuan = capaians.some(
                  (c) => (c?.status || "").toLowerCase() === "pengajuan"
                );

                return (
                  <AccordionItem
                    key={item.id}
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                    borderRadius="xl"
                    mb={4}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    boxShadow="md"
                    overflow="hidden"
                    _hover={{
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    <h2>
                      <AccordionButton
                        _hover={{
                          bg: colorMode === "dark" ? "gray.750" : "gray.50",
                        }}
                        py={4}
                        px={6}
                      >
                        <Box flex="1" textAlign="left">
                          <VStack align="start" spacing={2}>
                            <Flex w="100%" alignItems="center" gap={4}>
                              <Heading
                                as="h3"
                                size="md"
                                color={
                                  colorMode === "dark" ? "white" : "gray.800"
                                }
                                fontWeight="semibold"
                              >
                                {indikatorNama}
                              </Heading>
                              {hasPengajuan && (
                                <Badge
                                  colorScheme="orange"
                                  variant="solid"
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                >
                                  Pengajuan
                                </Badge>
                              )}
                              <Spacer />
                              <VStack align="end" spacing={1}>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.600"
                                  }
                                  fontWeight="medium"
                                >
                                  {tahunAnggaran ? `TA ${tahunAnggaran}` : ""}
                                  {jenisAnggaran ? ` • ${jenisAnggaran}` : ""}
                                </Text>
                                {anggaran && (
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.500"
                                        : "gray.700"
                                    }
                                    fontWeight="semibold"
                                  >
                                    {formatRupiah(anggaran)}
                                  </Text>
                                )}
                              </VStack>
                            </Flex>
                            {/* Info Unit Kerja, Satuan, dan Pegawai */}
                            {item?.indikator && (
                              <HStack
                                spacing={4}
                                flexWrap="wrap"
                                fontSize="xs"
                                color={
                                  colorMode === "dark" ? "gray.400" : "gray.500"
                                }
                              >
                                {/* Satuan Indikator */}
                                {item.indikator.satuanIndikator && (
                                  <HStack spacing={1}>
                                    <Icon
                                      as={FaTag}
                                      color="blue.400"
                                      boxSize={3}
                                    />
                                    <Text>
                                      <Text as="span" fontWeight="semibold">
                                        Satuan:
                                      </Text>{" "}
                                      {item.indikator.satuanIndikator.satuan}
                                    </Text>
                                  </HStack>
                                )}
                                {/* Unit Kerja */}
                                {item.indikator.daftarUnitKerja && (
                                  <HStack spacing={1}>
                                    <Icon
                                      as={FaBuilding}
                                      color="green.400"
                                      boxSize={3}
                                    />
                                    <Text>
                                      <Text as="span" fontWeight="semibold">
                                        Unit:
                                      </Text>{" "}
                                      {item.indikator.daftarUnitKerja.unitKerja}
                                    </Text>
                                  </HStack>
                                )}
                                {/* Pegawai */}
                                {item.indikator.pegawai && (
                                  <HStack spacing={1}>
                                    <Icon
                                      as={FaUser}
                                      color="purple.400"
                                      boxSize={3}
                                    />
                                    <Text>
                                      <Text as="span" fontWeight="semibold">
                                        PIC:
                                      </Text>{" "}
                                      {item.indikator.pegawai.nama} (
                                      {item.indikator.pegawai.nip})
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={6} px={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Text
                            fontWeight="bold"
                            mb={3}
                            fontSize="md"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            Capaian per Bulan
                          </Text>
                          <Box
                            overflowX="auto"
                            borderRadius="lg"
                            border="1px"
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                          >
                            <Table
                              size="sm"
                              variant="simple"
                              colorScheme={
                                colorMode === "dark" ? "gray" : "blue"
                              }
                            >
                              <Thead>
                                <Tr
                                  bg={
                                    colorMode === "dark"
                                      ? "blue.800"
                                      : "blue.50"
                                  }
                                >
                                  <Th
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.700"
                                    }
                                    fontWeight="bold"
                                  >
                                    Bulan
                                  </Th>
                                  <Th
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.700"
                                    }
                                    fontWeight="bold"
                                  >
                                    Nilai
                                  </Th>
                                  <Th
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.700"
                                    }
                                    fontWeight="bold"
                                  >
                                    Anggaran
                                  </Th>
                                  <Th
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.700"
                                    }
                                    fontWeight="bold"
                                  >
                                    Status
                                  </Th>
                                  <Th
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.700"
                                    }
                                    fontWeight="bold"
                                  >
                                    Bukti Dukung
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {capaians.length === 0 ? (
                                  <Tr>
                                    <Td
                                      colSpan={5}
                                      textAlign="center"
                                      borderColor={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.200"
                                      }
                                    >
                                      <Text
                                        fontSize="sm"
                                        color={
                                          colorMode === "dark"
                                            ? "gray.400"
                                            : "gray.500"
                                        }
                                        py={4}
                                      >
                                        Belum ada capaian.
                                      </Text>
                                    </Td>
                                  </Tr>
                                ) : (
                                  capaians.map((c) => (
                                    <Tr
                                      key={c.id}
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.700"
                                            : "gray.50",
                                      }}
                                      transition="all 0.2s"
                                    >
                                      <Td
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                        fontWeight="medium"
                                      >
                                        {getNamaBulan(c?.bulan)}
                                      </Td>
                                      <Td
                                        isNumeric
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                        fontWeight="semibold"
                                      >
                                        {c?.nilai ?? "-"}{" "}
                                        {item?.indikator?.satuanIndikator
                                          ?.satuan || ""}
                                      </Td>
                                      <Td
                                        isNumeric
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                        fontWeight="medium"
                                      >
                                        {formatRupiah(c?.anggaran)}
                                      </Td>
                                      <Td
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                      >
                                        <VStack align="start" spacing={2}>
                                          <Badge
                                            colorScheme={
                                              (
                                                c?.status || ""
                                              ).toLowerCase() === "diterima"
                                                ? "green"
                                                : (
                                                    c?.status || ""
                                                  ).toLowerCase() === "ditolak"
                                                ? "red"
                                                : (
                                                    c?.status || ""
                                                  ).toLowerCase() ===
                                                  "pengajuan"
                                                ? "orange"
                                                : "gray"
                                            }
                                            variant="subtle"
                                            borderRadius="md"
                                            px={2}
                                            py={1}
                                            textTransform="capitalize"
                                            display="flex"
                                            alignItems="center"
                                            gap={1.5}
                                          >
                                            {(c?.status || "").toLowerCase() ===
                                              "diterima" && (
                                              <Icon
                                                as={FaCheckCircle}
                                                boxSize={2.5}
                                              />
                                            )}
                                            {(c?.status || "").toLowerCase() ===
                                              "ditolak" && (
                                              <Icon
                                                as={FaTimesCircle}
                                                boxSize={2.5}
                                              />
                                            )}
                                            {(c?.status || "").toLowerCase() ===
                                              "pengajuan" && (
                                              <Icon
                                                as={FaClock}
                                                boxSize={2.5}
                                              />
                                            )}
                                            {c?.status || "-"}
                                          </Badge>
                                          <HStack spacing={2}>
                                            {(c?.status || "").toLowerCase() ===
                                            "pengajuan" ? (
                                              <>
                                                <Button
                                                  size="xs"
                                                  colorScheme="green"
                                                  isLoading={
                                                    loadingRowId === c.id
                                                  }
                                                  onClick={() =>
                                                    updateCapaianStatus(
                                                      c,
                                                      "diterima"
                                                    )
                                                  }
                                                >
                                                  Setujui
                                                </Button>
                                                <Button
                                                  size="xs"
                                                  colorScheme="red"
                                                  variant="outline"
                                                  isLoading={
                                                    loadingRowId === c.id
                                                  }
                                                  onClick={() =>
                                                    updateCapaianStatus(
                                                      c,
                                                      "ditolak"
                                                    )
                                                  }
                                                >
                                                  Tolak
                                                </Button>
                                              </>
                                            ) : (
                                              <Button
                                                size="xs"
                                                colorScheme="orange"
                                                variant="outline"
                                                isLoading={
                                                  loadingRowId === c.id
                                                }
                                                onClick={() =>
                                                  updateCapaianStatus(
                                                    c,
                                                    "pengajuan"
                                                  )
                                                }
                                              >
                                                Ajukan
                                              </Button>
                                            )}
                                          </HStack>
                                        </VStack>
                                      </Td>
                                      <Td
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                      >
                                        {c?.bukti ? (
                                          <Button
                                            as="a"
                                            href={c.bukti}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="xs"
                                            colorScheme="blue"
                                            variant="outline"
                                            leftIcon={
                                              <Icon as={FaExternalLinkAlt} />
                                            }
                                            _hover={{
                                              bg: "blue.50",
                                              borderColor: "blue.400",
                                            }}
                                          >
                                            Lihat Bukti
                                          </Button>
                                        ) : (
                                          <Text
                                            fontSize="sm"
                                            color={
                                              colorMode === "dark"
                                                ? "gray.400"
                                                : "gray.500"
                                            }
                                            fontStyle="italic"
                                          >
                                            -
                                          </Text>
                                        )}
                                      </Td>
                                    </Tr>
                                  ))
                                )}
                              </Tbody>
                            </Table>
                          </Box>
                        </Box>

                        {Array.isArray(item?.targetTriwulans) &&
                        item.targetTriwulans.length > 0 ? (
                          <Box>
                            <Text
                              fontWeight="bold"
                              mb={3}
                              fontSize="md"
                              color={
                                colorMode === "dark" ? "white" : "gray.800"
                              }
                            >
                              Target Triwulan
                            </Text>
                            <Flex wrap="wrap" gap={3}>
                              {item.targetTriwulans
                                .slice()
                                .sort((a, b) =>
                                  (a?.namaTarget?.nama || "").localeCompare(
                                    b?.namaTarget?.nama || ""
                                  )
                                )
                                .map((tw) => (
                                  <Box
                                    key={tw.id}
                                    borderWidth="1px"
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "blue.200"
                                    }
                                    borderRadius="lg"
                                    p={4}
                                    minW="140px"
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "blue.50"
                                    }
                                    _hover={{
                                      boxShadow: "md",
                                      borderColor:
                                        colorMode === "dark"
                                          ? "blue.500"
                                          : "blue.400",
                                    }}
                                    transition="all 0.2s"
                                  >
                                    <Text
                                      fontSize="sm"
                                      color={
                                        colorMode === "dark"
                                          ? "gray.400"
                                          : "gray.600"
                                      }
                                      mb={1}
                                      fontWeight="medium"
                                    >
                                      {tw?.namaTarget?.nama?.toUpperCase()}
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      fontSize="lg"
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.800"
                                      }
                                    >
                                      {tw?.nilai ?? "-"}{" "}
                                      {item?.indikator?.satuanIndikator
                                        ?.satuan || ""}
                                    </Text>
                                  </Box>
                                ))}
                            </Flex>
                          </Box>
                        ) : null}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </Box>
      </Box>
    </LayoutPerencanaan>
  );
}

export default DaftarCapaian;
