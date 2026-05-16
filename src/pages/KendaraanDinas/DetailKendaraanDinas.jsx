import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../Componets/Layout";
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Foto from "../../assets/add_photo.png";
function DetailkendaraanDinas(props) {
  const [DataKendaraanDinas, setDataKendaraanDinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKendaraan, setSelectedKendaraan] = useState(null);
  const [formData, setFormData] = useState({
    catatan: "",
    jarak: "",
    status: "diterima",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const user = useSelector(userRedux);
  async function fetchDataKendaraanDinas() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan-dinas/get/detail-kendaraan/${props.match.params.id}`
      )
      .then((res) => {
        setDataKendaraanDinas(res.data.result);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataKendaraanDinas();
  }, []);

  const openModalTerima = (kendaraan) => {
    setSelectedKendaraan(kendaraan);
    setIsModalOpen(true);
  };

  // Fungsi untuk mendapatkan data kendaraan yang akan ditampilkan di modal
  // Menampilkan index yang dipilih dan index berikutnya (total 2 index = 4 foto)
  const getKendaraanDataForModal = () => {
    if (!data?.kendaraanDinas || !selectedKendaraan) return [];

    const allData = data.kendaraanDinas;
    const selectedIndex = allData.findIndex(
      (k) => k.id === selectedKendaraan.id
    );

    if (selectedIndex === -1) return [];

    // Ambil index yang dipilih dan index berikutnya
    // Urutan: index besar di kiri, index kecil di kanan
    const result = [];

    // Jika ada index berikutnya, tambahkan dulu (index lebih besar)
    if (selectedIndex + 1 < allData.length) {
      result.push(allData[selectedIndex + 1]);
    }

    // Tambahkan index yang dipilih (index lebih kecil)
    result.push(allData[selectedIndex]);

    return result;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKendaraan(null);
    setFormData({
      catatan: "",
      jarak: "",
      status: "diterima",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmitTerima = async () => {
    const newErrors = {};

    if (!formData.catatan.trim()) {
      newErrors.catatan = "Catatan harus diisi";
    }

    if (!formData.jarak.trim()) {
      newErrors.jarak = "Jarak harus diisi";
    } else if (isNaN(formData.jarak) || parseFloat(formData.jarak) < 0) {
      newErrors.jarak = "Jarak harus berupa angka positif";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kendaraan-dinas/verifikasi/${selectedKendaraan.id}`,
        {
          catatan: formData.catatan,
          jarak: formData.jarak,
          status: formData.status,
        }
      );

      toast({
        title: "Berhasil!",
        description: "Kendaraan berhasil diterima.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      closeModal();
      fetchDataKendaraanDinas();
    } catch (err) {
      console.error(err.message);
      toast({
        title: "Error!",
        description: "Gagal menerima kendaraan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
  const data = Array.isArray(DataKendaraanDinas)
    ? DataKendaraanDinas[0]
    : DataKendaraanDinas;

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        <VStack alignItems="start" spacing={6} py={6}>
          <Heading size="lg">Detail Kendaraan Dinas</Heading>

          <HStack alignItems="start" spacing={6} w="full">
            <Box>
              <Image
                src={data?.foto ? `${apiBaseUrl}${data.foto}` : Foto}
                alt="Foto Kendaraan"
                boxSize="220px"
                objectFit="cover"
                borderRadius="md"
                fallbackSrc={Foto}
              />
            </Box>
            <VStack alignItems="start" spacing={1}>
              <Text fontWeight="bold">Nomor Polisi</Text>
              <Text fontSize="xl">
                {`${data?.seri ?? ""} ${data?.nomor ?? ""}`.trim() || "-"}
              </Text>
              <Text color="gray.500">
                Jenis ID: {data?.jenisKendaraanId ?? "-"}
              </Text>
              <Text color="gray.500">No. Rangka: {data?.noRangka ?? "-"}</Text>
              <Text color="gray.500">No. Mesin: {data?.noMesin ?? "-"}</Text>
            </VStack>
          </HStack>

          <Box w="full">
            <Heading size="md" mb={3}>
              Riwayat Peminjaman
            </Heading>
            <Table variant="primary" size="sm">
              <Thead>
                <Tr>
                  <Th>Perjalanan</Th>
                  <Th>Personil</Th>
                  <Th>Tujuan</Th>
                  <Th>Tanggal</Th>
                  <Th>Status</Th>
                  <Th>Foto KM Akhir</Th>
                  <Th>Foto Kondisi Akhir</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(data?.kendaraanDinas || []).map((k) => (
                  <Tr key={k.id}>
                    <Td>
                      <Box>
                        <Text fontSize="12px" fontWeight="bold">
                          Total: {k.perjalanans?.length || 0} perjalanan
                        </Text>
                        {k.perjalanans?.map((perjalanan, idx) => (
                          <Text
                            key={perjalanan.id}
                            fontSize="10px"
                            color="gray.500"
                          >
                            • Perjalanan {idx + 1} (ID: {perjalanan.id})
                          </Text>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        {k.perjalanans?.map((perjalanan, idx) => (
                          <Box key={perjalanan.id} mb={1}>
                            <Text fontSize="10px" color="gray.500" mb={1}>
                              Perjalanan {idx + 1}:
                            </Text>
                            {perjalanan?.personils?.map((personil) => (
                              <Text key={personil.id} fontSize="12px">
                                • {personil?.pegawai?.nama || "N/A"}
                              </Text>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        {k.perjalanans?.map((perjalanan, idx) => (
                          <Box key={perjalanan.id} mb={1}>
                            <Text fontSize="10px" color="gray.500" mb={1}>
                              Perjalanan {idx + 1}:
                            </Text>
                            {perjalanan?.tempats?.map((tempat, tIdx) => (
                              <Box key={tIdx}>
                                <Text fontSize="12px" fontWeight="bold">
                                  • {tempat?.tempat || "N/A"}
                                </Text>
                                {tempat?.dalamKota && (
                                  <Text fontSize="10px" color="gray.600">
                                    ({tempat.dalamKota.nama})
                                  </Text>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        {k.perjalanans && k.perjalanans.length > 0 && (
                          <>
                            <Text fontSize="12px" fontWeight="bold">
                              Berangkatxxxx:{" "}
                              {new Date(
                                k.perjalanans[0]?.tanggalBerangkat
                              ).toLocaleDateString("id-ID")}
                            </Text>
                            <Text fontSize="12px" fontWeight="bold">
                              Pulang:{" "}
                              {new Date(
                                k.perjalanans[
                                  k.perjalanans.length - 1
                                ]?.tanggalPulang
                              ).toLocaleDateString("id-ID")}
                            </Text>
                            {k.perjalanans.length > 1 && (
                              <Text fontSize="10px" color="gray.500" mt={1}>
                                Detail per perjalanan:
                              </Text>
                            )}
                            {k.perjalanans.map((perjalanan, idx) => (
                              <Box key={perjalanan.id} mb={1}>
                                <Text fontSize="10px" color="gray.500">
                                  Perjalanan {idx + 1}:{" "}
                                  {new Date(
                                    perjalanan?.tanggalBerangkat
                                  ).toLocaleDateString("id-ID")}{" "}
                                  -{" "}
                                  {new Date(
                                    perjalanan?.tanggalPulang
                                  ).toLocaleDateString("id-ID")}
                                </Text>
                              </Box>
                            ))}
                          </>
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <Text
                        fontSize="12px"
                        fontWeight="bold"
                        color={
                          k.status === "dipinjam" ? "red.500" : "green.500"
                        }
                        textTransform="capitalize"
                      >
                        {k.status ?? "-"}
                      </Text>
                    </Td>
                    <Td>
                      {k.kmAkhir ? (
                        <Image
                          src={`${apiBaseUrl}${k.kmAkhir}`}
                          alt="KM Akhir"
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td>
                      {k.kondisiAkhir ? (
                        <Image
                          src={`${apiBaseUrl}${k.kondisiAkhir}`}
                          alt="Kondisi Akhir"
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td>
                      <Button
                        colorScheme="green"
                        size="sm"
                        onClick={() => openModalTerima(k)}
                        isDisabled={k.status === "kembali"}
                      >
                        Terima
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Box>

      {/* Modal Terima Kendaraan */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Konfirmasi Penerimaan Kendaraan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedKendaraan && (
              <VStack spacing={6} flexDirection={"row"}>
                <Box>
                  {/* Foto KM Akhir dari Index yang Dipilih dan Berikutnya */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>
                      Bukti jarak
                    </Text>
                    <SimpleGrid columns={2} spacing={4}>
                      {getKendaraanDataForModal().map((kendaraan, index) => {
                        const allData = data?.kendaraanDinas || [];
                        const selectedIndex = allData.findIndex(
                          (k) => k.id === selectedKendaraan.id
                        );
                        // Karena urutan array sudah diubah (besar di kiri, kecil di kanan)
                        // Index 0 = selectedIndex + 1 (jika ada), Index 1 = selectedIndex
                        const actualIndex =
                          index === 0 && selectedIndex + 1 < allData.length
                            ? selectedIndex + 1
                            : selectedIndex;

                        return (
                          <Box key={`km-${actualIndex}`}>
                            {/* <Text fontSize="sm" color="gray.600" mb={2}>
                            Foto KM Akhirxxx (Index {actualIndex + 1})
                          </Text> */}
                            {kendaraan.kmAkhir ? (
                              <Image
                                src={`${apiBaseUrl}${kendaraan.kmAkhir}`}
                                alt={`KM Akhir Index ${actualIndex + 1}`}
                                boxSize="40vh"
                                objectFit="cover"
                                borderRadius="md"
                                border="2px solid"
                                borderColor="gray.200"
                              />
                            ) : (
                              <Box
                                boxSize="40vh"
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text color="gray.500">
                                  Foto tidak tersedia
                                </Text>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>

                  {/* Foto Kondisi Akhir dari Index yang Dipilih dan Berikutnya */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>
                      Bukti Kondisi
                    </Text>
                    <SimpleGrid columns={2} spacing={4}>
                      {getKendaraanDataForModal().map((kendaraan, index) => {
                        const allData = data?.kendaraanDinas || [];
                        const selectedIndex = allData.findIndex(
                          (k) => k.id === selectedKendaraan.id
                        );
                        // Karena urutan array sudah diubah (besar di kiri, kecil di kanan)
                        // Index 0 = selectedIndex + 1 (jika ada), Index 1 = selectedIndex
                        const actualIndex =
                          index === 0 && selectedIndex + 1 < allData.length
                            ? selectedIndex + 1
                            : selectedIndex;

                        return (
                          <Box key={`kondisi-${actualIndex}`}>
                            {/* <Text fontSize="sm" color="gray.600" mb={2}>
                            Foto Kondisi Akhir (Index {actualIndex + 1})
                          </Text> */}
                            {kendaraan.kondisiAkhir ? (
                              <Image
                                src={`${apiBaseUrl}${kendaraan.kondisiAkhir}`}
                                alt={`Kondisi Akhir Index ${actualIndex + 1}`}
                                boxSize="40vh"
                                objectFit="cover"
                                borderRadius="md"
                                border="2px solid"
                                borderColor="gray.200"
                              />
                            ) : (
                              <Box
                                boxSize="40vh"
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text color="gray.500">
                                  Foto tidak tersedia
                                </Text>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                </Box>
                <Box>
                  {/* Informasi Kendaraan */}
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>
                      Informasi Peminjaman
                    </Text>
                    <SimpleGrid columns={1} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Status:
                        </Text>
                        <Text fontWeight="medium" textTransform="capitalize">
                          {selectedKendaraan.status || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Total Perjalanan:
                        </Text>
                        <Text fontWeight="medium">
                          {selectedKendaraan.perjalanans?.length || 0}{" "}
                          perjalanan
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Personil:
                        </Text>
                        <VStack align="start" spacing={1}>
                          {selectedKendaraan.perjalanans?.map(
                            (perjalanan, idx) => (
                              <Box key={perjalanan.id}>
                                <Text fontSize="xs" color="gray.500">
                                  Perjalanan {idx + 1}:
                                </Text>
                                {perjalanan?.personils?.map((personil) => (
                                  <Text
                                    key={personil.id}
                                    fontWeight="medium"
                                    fontSize="sm"
                                  >
                                    • {personil?.pegawai?.nama || "N/A"}
                                  </Text>
                                ))}
                              </Box>
                            )
                          )}
                        </VStack>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Tujuan:
                        </Text>
                        <VStack align="start" spacing={1}>
                          {selectedKendaraan.perjalanans?.map(
                            (perjalanan, idx) => (
                              <Box key={perjalanan.id}>
                                <Text fontSize="xs" color="gray.500">
                                  Perjalanan {idx + 1}:
                                </Text>
                                {perjalanan?.tempats?.map((tempat, tIdx) => (
                                  <Text
                                    key={tIdx}
                                    fontWeight="medium"
                                    fontSize="sm"
                                  >
                                    • {tempat?.tempat || "N/A"}
                                    {tempat?.dalamKota && (
                                      <Text as="span" color="gray.500">
                                        {" "}
                                        ({tempat.dalamKota.nama})
                                      </Text>
                                    )}
                                  </Text>
                                ))}
                              </Box>
                            )
                          )}
                        </VStack>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Tanggal:
                        </Text>
                        <VStack align="start" spacing={1}>
                          {selectedKendaraan.perjalanans &&
                            selectedKendaraan.perjalanans.length > 0 && (
                              <>
                                <Box>
                                  <Text fontSize="xs" color="gray.500">
                                    Rentang Waktu:
                                  </Text>
                                  <Text fontWeight="medium" fontSize="sm">
                                    Berangkat:{" "}
                                    {new Date(
                                      selectedKendaraan.perjalanans[0]?.tanggalBerangkat
                                    ).toLocaleDateString("id-ID")}
                                  </Text>
                                  <Text fontWeight="medium" fontSize="sm">
                                    Pulang:{" "}
                                    {new Date(
                                      selectedKendaraan.perjalanans[
                                        selectedKendaraan.perjalanans.length - 1
                                      ]?.tanggalPulang
                                    ).toLocaleDateString("id-ID")}
                                  </Text>
                                </Box>
                                {selectedKendaraan.perjalanans.length > 1 && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500">
                                      Detail per perjalanan:
                                    </Text>
                                    {selectedKendaraan.perjalanans.map(
                                      (perjalanan, idx) => (
                                        <Text
                                          key={perjalanan.id}
                                          fontWeight="medium"
                                          fontSize="sm"
                                        >
                                          • Perjalanan {idx + 1}:{" "}
                                          {new Date(
                                            perjalanan?.tanggalBerangkat
                                          ).toLocaleDateString("id-ID")}{" "}
                                          -{" "}
                                          {new Date(
                                            perjalanan?.tanggalPulang
                                          ).toLocaleDateString("id-ID")}
                                        </Text>
                                      )
                                    )}
                                  </Box>
                                )}
                              </>
                            )}
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Form Input */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>
                      Konfirmasi Penerimaan
                    </Text>
                    <FormControl isInvalid={errors.catatan}>
                      <FormLabel>Catatan</FormLabel>
                      <Textarea
                        name="catatan"
                        value={formData.catatan}
                        onChange={handleInputChange}
                        placeholder="Masukkan catatan penerimaan kendaraan..."
                        rows={4}
                      />
                      <FormErrorMessage>{errors.catatan}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.jarak} mt={4}>
                      <FormLabel>Jarak (KM)</FormLabel>
                      <Input
                        name="jarak"
                        type="number"
                        value={formData.jarak}
                        onChange={handleInputChange}
                        placeholder="Masukkan jarak tempuh kendaraan..."
                      />
                      <FormErrorMessage>{errors.jarak}</FormErrorMessage>
                    </FormControl>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeModal}>
              Batal
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitTerima}
              isLoading={isLoading}
              loadingText="Mengirim..."
            >
              Konfirmasi Terima
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default DetailkendaraanDinas;
