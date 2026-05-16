import React, { useState, useEffect } from "react";
import axios from "axios";

import LayoutAset from "../../Componets/Aset/LayoutAset";
import TambahFotoKendaraan from "../../Componets/TambahFotoKendaraan";
import { Link, useHistory } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Select,
  Flex,
  ModalCloseButton,
  ModalBody,
  Textarea,
  useToast,
  HStack,
  Heading,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";

function DetailKendaraan(props) {
  const [detailKendaraan, setDetailKendaraan] = useState([]);
  const [nomorSurat, setNomorSurat] = useState("");
  const [randomNumber, setRandomNumber] = useState(0);
  const [jenisList, setJenisList] = useState([]);
  const [pegawaiId, setPegawaiId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const [tanggal, setTanggal] = useState(new Date());
  const [keterangan, setKeterangan] = useState("");
  const toast = useToast();
  const [seed, setSeed] = useState(null);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isMutasiOpen,
    onOpen: onMutasiOpen,
    onClose: onMutasiClose,
  } = useDisclosure();
  const handleLinkClick = (link) => {
    if (!link) return;
    // Pastikan link dimulai dengan http atau https
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };
  const fetchDataKendaraan = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/get/detail/${
          props.match.params.id
        }`
      );
      const result = res.data.result;
      setDetailKendaraan(result);
      setNomorSurat(res.data.resultTemplate[0]?.nomorSurat || "");
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };
  const mutasi = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/post/mutasi`,
        {
          keterangan,
          unitKerjaId,
          pegawaiId,
          kendaraanId: props.match.params.id,
          tanggal,
          asalUnitKerjaId: detailKendaraan?.kendaraanUK?.id,
          asalPegawaiId: detailKendaraan?.pegawaiId,
        }
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
        onMutasiClose();
        fetchDataKendaraan();
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
        onMutasiClose();
      });
  };
  const fetchSeed = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/get/seed`
      );
      const result = res.data;
      setSeed(result);
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDataKendaraan();
    fetchSeed();
  }, []);

  const editSchema = Yup.object().shape({
    nomor: Yup.string().required("Nomor kendaraan wajib diisi"),
    noKontak: Yup.number().required("Nomor kendaraan wajib diisi"),
    noRangka: Yup.string().required("Nomor rangka wajib diisi"),
    noMesin: Yup.string().required("Nomor mesin wajib diisi"),

    merek: Yup.string().required("Merek wajib diisi"),
    warna: Yup.string().required("warna wajib diisi"),
    tgl_pkb: Yup.date().required("Tanggal PKB wajib diisi"),
    tg_stnk: Yup.date().required("Tanggal STNK wajib diisi"),
    jenisKendaraanId: Yup.string().required("Jenis kendaraan wajib dipilih"),
    statusKendaraanId: Yup.string().required(""),
    kondisiId: Yup.string().required(""),
    nilaiPerolehan: Yup.number().required("Nilai perolehan Wajib diisi"),
    tanggalPerolehan: Yup.date().required("Tanggal Perolehan Wajib disi"),
    nibar: Yup.string().required("nibar wajib diisi"),
    link: Yup.string().required("Link BPKB wajib diisi"),
  });

  const handleSubmitEdit = async (values, actions) => {
    console.log(values);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/kendaraan/edit/${
          detailKendaraan.id
        }`,
        values
      );
      actions.setSubmitting(false);
      onEditClose();
      fetchDataKendaraan(); // refresh
    } catch (error) {
      console.error("Gagal update data kendaraan", error);
      actions.setSubmitting(false);
    }
  };

  return (
    <LayoutAset>
      <Box pb={"60px"}>
        <Container variant={"primary"} maxW={"1280px"} p={"30px"}>
          <Box display="flex" gap={5}>
            <Box>
              <TambahFotoKendaraan
                foto={detailKendaraan?.foto}
                id={detailKendaraan?.id}
                randomNumber={setRandomNumber}
              />
            </Box>
            <Spacer />
            <Box p={4} borderWidth="1px" boxShadow="md" bg="gray.50">
              <Heading as="h1" size="xl" mb={4} color="aset">
                Detail Kendaraan
              </Heading>
              <VStack align="start" spacing={3}>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Nomor Kendaraan:
                  </Text>
                  <Text>
                    KT {detailKendaraan?.nomor} {detailKendaraan?.seri}
                  </Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Unit Kerja:
                  </Text>
                  <Text>{detailKendaraan?.kendaraanUK?.unitKerja || "-"}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Jenis Kendaraan:
                  </Text>
                  <Text>{detailKendaraan?.jenisKendaraan?.jenis}</Text>
                </HStack>{" "}
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Merek Mobil:
                  </Text>
                  <Text>{detailKendaraan?.merek}</Text>
                </HStack>{" "}
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Warna Mobil:
                  </Text>
                  <Text>{detailKendaraan?.warna}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Tanggal STNK:
                  </Text>
                  <Text>
                    {detailKendaraan?.tgl_pkb &&
                      new Date(detailKendaraan?.tgl_pkb).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                  </Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Tanggal BPKB:
                  </Text>
                  <Text>
                    {detailKendaraan?.tg_stnk &&
                      new Date(detailKendaraan?.tg_stnk).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                  </Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Nomor Rangka:
                  </Text>
                  <Text>{detailKendaraan?.noRangka}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Nomor Mesin:
                  </Text>
                  <Text>{detailKendaraan?.noMesin}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Kondisi:
                  </Text>
                  <Text>{detailKendaraan?.kondisi?.nama}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Nilai Perolehan:
                  </Text>
                  <Text>{detailKendaraan?.nilaiPerolehan}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Tangal Perolehan:
                  </Text>
                  <Text>
                    {" "}
                    {detailKendaraan?.tgl_pkb &&
                      new Date(
                        detailKendaraan?.tanggalPerolehan
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Nibar:
                  </Text>
                  <Text>{detailKendaraan?.nibar}</Text>
                </HStack>
                <HStack width="100%">
                  <Text fontWeight="semibold" minW="140px">
                    Status:
                  </Text>
                  <Text>{detailKendaraan?.statusKendaraan?.status}</Text>
                </HStack>
              </VStack>
              <Flex mt={"30px"} gap={5}>
                <Button variant={"primary"} onClick={onEditOpen}>
                  Edit
                </Button>
                <Button variant={"primary"} onClick={onMutasiOpen}>
                  Mutasi
                </Button>
                <Button
                  variant={"primary"}
                  onClick={() => handleLinkClick(detailKendaraan?.link)}
                >
                  BPKB
                </Button>
              </Flex>
            </Box>
          </Box>
        </Container>

        <Container
          variant={"primary"}
          maxW={"1280px"}
          p={"0px"}
          pt={"30px"}
          mt={"30px"}
        >
          <HStack>
            <Box bgColor={"aset"} width={"30px"} height={"30px"}></Box>
            <Heading color={"aset"}>Riwayat Surat Pengantar</Heading>
          </HStack>
          <Box p={"30px"}>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>Nomor Surat</Th>
                  <Th>Tanggal</Th>
                  <Th>Pembuat Surat</Th>
                </Tr>
              </Thead>
              <Tbody>
                {detailKendaraan?.suratPengantars?.map((item, index) => (
                  <Tr key={index}>
                    <Td>{nomorSurat.replace("NOMOR", item.noLoket)}</Td>
                    <Td>
                      {item?.updatedAt
                        ? new Date(item?.updatedAt).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </Td>
                    <Td>{item?.user?.nama}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>

        <Container
          variant={"primary"}
          maxW={"1280px"}
          ps={"0px"}
          pt={"30px"}
          mt={"30px"}
        >
          <HStack>
            <Box bgColor={"aset"} width={"30px"} height={"30px"}></Box>
            <Heading color={"aset"}>Riwayat Mutasi Kendaraan</Heading>
          </HStack>
          <Box px={"30px"} pb={"30px"} pt={"20px"}>
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th
                    colSpan={2}
                    borderColor={"white"}
                    border={"1px"}
                    style={{ textAlign: "center" }}
                  >
                    unit kerja
                  </Th>
                  <Th
                    colSpan={2}
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    pegawai
                  </Th>
                  <Th
                    rowSpan={2}
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    tanggal BAST
                  </Th>
                  <Th
                    rowSpan={2}
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    keterangan
                  </Th>
                </Tr>
                <Tr>
                  <Th
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    asal
                  </Th>
                  <Th
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    tujuan
                  </Th>
                  <Th
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    asal
                  </Th>
                  <Th
                    style={{ textAlign: "center" }}
                    borderColor={"white"}
                    border={"1px"}
                  >
                    tujuan
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {detailKendaraan?.mutasiKendaraans?.map((item, index) => (
                  <Tr key={index}>
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item.unitKerjaAsal?.unitKerja}
                    </Td>
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item.unitKerjaTujuan?.unitKerja}
                    </Td>
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item.pegawaiAsal?.nama}
                    </Td>
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item.pegawaiTujuan?.nama}
                    </Td>{" "}
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item?.tanggal
                        ? new Date(item?.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>
                    <Td
                      style={{ textAlign: "center" }}
                      borderColor={"white"}
                      border={"1px"}
                    >
                      {item?.keterangan}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>

        {/* Modal Edit */}
        <Modal
          closeOnOverlayClick={false}
          isOpen={isEditOpen}
          onClose={onEditClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="800px">
            <ModalHeader>Edit Data Kendaraan</ModalHeader>
            <ModalCloseButton />
            <Formik
              initialValues={{
                nomor: detailKendaraan?.nomor || "",
                noKontak: detailKendaraan?.noKontak || 0,
                noRangka: detailKendaraan?.noRangka || "",
                noMesin: detailKendaraan?.noMesin || "",
                merek: detailKendaraan?.merek || "",
                warna: detailKendaraan?.warna || "",
                tgl_pkb: detailKendaraan?.tgl_pkb?.split("T")[0] || "",
                tg_stnk: detailKendaraan?.tg_stnk?.split("T")[0] || "",
                jenisKendaraanId:
                  detailKendaraan?.jenisKendaraan?.id?.toString() || "", // Penting: harus string
                statusKendaraanId:
                  detailKendaraan?.statusKendaraan?.id?.toString() || "", // Penting: harus string
                kondisiId: detailKendaraan?.kondisi?.id?.toString() || "", // Penting: harus string

                nilaiPerolehan: detailKendaraan?.nilaiPerolehan,
                tanggalPerolehan: detailKendaraan?.tanggalPerolehan,
                nibar: detailKendaraan?.nibar,
                link: detailKendaraan?.link,
              }}
              validationSchema={editSchema}
              onSubmit={handleSubmitEdit}
              enableReinitialize
            >
              {(props) => (
                <Form>
                  <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                      <Field name="nomor">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.nomor && form.touched.nomor}
                          >
                            <FormLabel>Nomor Kendaraan</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.nomor}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="noRangka">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.noRangka && form.touched.noRangka
                            }
                          >
                            <FormLabel>Nomor Rangka</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.noRangka}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="noMesin">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.noMesin && form.touched.noMesin
                            }
                          >
                            <FormLabel>Nomor Mesin</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.noMesin}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="tgl_pkb">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.tgl_pkb && form.touched.tgl_pkb
                            }
                          >
                            <FormLabel>Tanggal PKB</FormLabel>
                            <Input type="date" {...field} />
                            <FormErrorMessage>
                              {form.errors.tgl_pkb}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="tg_stnk">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.tg_stnk && form.touched.tg_stnk
                            }
                          >
                            <FormLabel>Tanggal STNK</FormLabel>
                            <Input type="date" {...field} />
                            <FormErrorMessage>
                              {form.errors.tg_stnk}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="jenisKendaraanId">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.jenisKendaraanId &&
                              form.touched.jenisKendaraanId
                            }
                          >
                            <FormLabel>Jenis Kendaraan</FormLabel>
                            <Select
                              placeholder="Pilih Jenis Kendaraan"
                              {...field}
                            >
                              {Array.isArray(seed?.jenis) &&
                                seed.jenis.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.id.toString()}
                                  >
                                    {item.jenis}
                                  </option>
                                ))}
                            </Select>
                            <FormErrorMessage>
                              {form.errors.jenisKendaraanId}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="merek">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.merek && form.touched.merek}
                          >
                            <FormLabel>Merek</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.merek}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="warna">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.warna && form.touched.warna}
                          >
                            <FormLabel>warna</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.warna}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="nilaiPerolehan">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.nilaiPerolehan &&
                              form.touched.nilaiPerolehan
                            }
                          >
                            <FormLabel>Nilai Perolehan</FormLabel>
                            <Input type="number" {...field} />
                            <FormErrorMessage>
                              {form.errors.nilaiPerolehan}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="tanggalPerolehan">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.tanggalPerolehan &&
                              form.touched.tanggalPerolehan
                            }
                          >
                            <FormLabel>Tanggal Perolehan</FormLabel>
                            <Input type="date" {...field} />
                            <FormErrorMessage>
                              {form.errors.tanggalPerolehan}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="nibar">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.nibar && form.touched.nibar}
                          >
                            <FormLabel>nibar</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.nibar}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="statusKendaraanId">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.statusKendaraanId &&
                              form.touched.statusKendaraanId
                            }
                          >
                            <FormLabel>status Kendaraan</FormLabel>
                            <Select
                              placeholder="Pilih status Kendaraan"
                              {...field}
                            >
                              {Array.isArray(seed?.status) &&
                                seed.status.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.id.toString()}
                                  >
                                    {item.status}
                                  </option>
                                ))}
                            </Select>
                            <FormErrorMessage>
                              {form.errors.statusKendaraanId}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="kondisiId">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.kondisiId && form.touched.kondisiId
                            }
                          >
                            <FormLabel>Kondisi Kendaraan</FormLabel>
                            <Select
                              placeholder="Pilih Kondisi Kendaraan"
                              {...field}
                            >
                              {Array.isArray(seed?.kondisi) &&
                                seed.kondisi.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.id.toString()}
                                  >
                                    {item.nama}
                                  </option>
                                ))}
                            </Select>
                            <FormErrorMessage>
                              {form.errors.kondisiId}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>{" "}
                      <Field name="noKontak">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.noKontak && form.touched.noKontak
                            }
                          >
                            <FormLabel>Nomor Kontak</FormLabel>
                            <Input type="number" {...field} />
                            <FormErrorMessage>
                              {form.errors.noKontak}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="link">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.link && form.touched.link}
                          >
                            <FormLabel>Link BPKB</FormLabel>
                            <Input {...field} />
                            <FormErrorMessage>
                              {form.errors.link}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </VStack>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      isLoading={props.isSubmitting} // gunakan ini jika ingin loading state otomatis
                      type="submit" // cukup type submit tanpa onClick
                    >
                      Simpan
                    </Button>
                    <Button onClick={onEditClose}>Batal</Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>

        <Modal
          closeOnOverlayClick={false}
          isOpen={isMutasiOpen}
          onClose={onMutasiClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="800px">
            <ModalHeader>Mutasi Kendaraan</ModalHeader>
            <ModalCloseButton />{" "}
            <Box p={"30px"}>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/pegawai/search?q=${inputValue}`
                      );

                      const filtered = res.data.result;

                      return filtered.map((val) => ({
                        value: val.id,
                        label: val.nama,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik Nama Pegawai"
                  onChange={(selectedOption) => {
                    setPegawaiId(selectedOption.value);
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "terang",
                      border: "0px",
                      height: "60px",
                      _hover: { borderColor: "yellow.700" },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl my={"30px"} border={0} bgColor={"white"} flex="1">
                <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                <Select2
                  options={seed?.unitKerja?.map((val) => ({
                    value: val.id,
                    label: `${val.unitKerja}`,
                  }))}
                  placeholder="Contoh: Laboratorium kesehatan daerah"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setUnitKerjaId(selectedOption.value);
                  }}
                  components={{
                    DropdownIndicator: () => null, // Hilangkan tombol panah
                    IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
                  }}
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "terang",
                      border: "0px",
                      height: "60px",
                      _hover: {
                        borderColor: "yellow.700",
                      },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>{" "}
              <FormControl mt={"30px"}>
                <FormLabel fontSize={"24px"}>Tanggal BAST</FormLabel>
                <Input
                  bgColor={"terang"}
                  type="date"
                  height={"60px"}
                  onChange={(e) => setTanggal(e.target.value)}
                  placeholder="Contoh: mutasi ke BKAD"
                />
              </FormControl>
              <FormControl mt={"30px"}>
                <FormLabel fontSize={"24px"}>keterangan</FormLabel>
                <Textarea
                  bgColor={"terang"}
                  height={"100px"}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: mutasi ke BKAD"
                />
              </FormControl>
            </Box>{" "}
            <ModalFooter pe={"30px"} pb={"30px"}>
              <Button onClick={mutasi} variant={"primary"}>
                Mutasi
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </LayoutAset>
  );
}

export default DetailKendaraan;
