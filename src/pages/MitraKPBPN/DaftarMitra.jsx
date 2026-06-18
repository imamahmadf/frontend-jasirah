import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  VStack,
  useToast,
  FormLabel,
  Select,
  Container,
  Thead,
  Table,
  Tr,
  Th,
  Td,
  Tbody,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Image,
  Divider,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import LayoutKPBPN from "../../Componets/KPBPN/LayoutKPBPN";
import FotoPlaceholder from "../../assets/add_photo.png";

const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const getImageUrl = (path) => (path ? `${API_BASE}${path}` : null);

const FileUploadField = ({
  label,
  name,
  preview,
  onChange,
  error,
  touched,
}) => {
  const inputRef = useRef(null);

  return (
    <FormControl isInvalid={touched && error}>
      <FormLabel>{label}</FormLabel>
      <Input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        display="none"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onChange(file);
        }}
      />
      <Image
        src={preview || FotoPlaceholder}
        alt={label}
        w="100%"
        maxH="200px"
        objectFit="cover"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        mb={2}
        cursor="pointer"
        onClick={() => inputRef.current?.click()}
      />
      <Button
        variant="secondary"
        w="100%"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        Pilih Gambar
      </Button>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

const DaftarMitra = () => {
  const toast = useToast();
  const [dataMitra, setDataMitra] = useState([]);
  const [dataTransportir, setDataTransportir] = useState([]);
  const [dataJenisTransportir, setDataJenisTransportir] = useState([]);
  const [previewFoto, setPreviewFoto] = useState(null);

  const {
    isOpen: isMitraOpen,
    onOpen: onMitraOpen,
    onClose: onMitraClose,
  } = useDisclosure();
  const {
    isOpen: isTransportirOpen,
    onOpen: onTransportirOpen,
    onClose: onTransportirClose,
  } = useDisclosure();
  const {
    isOpen: isSupirOpen,
    onOpen: onSupirOpen,
    onClose: onSupirClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const fetchDataMitra = async () => {
    try {
      const res = await axios.get(`${API_BASE}/mitra/get`);
      setDataMitra(res.data.resultMitra || []);
      setDataTransportir(res.data.resultTransportir || []);
      setDataJenisTransportir(res.data.resultJenisTransportir || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal memuat data",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDataMitra();
  }, []);

  const allSupir = (dataMitra || []).flatMap((mitra) =>
    (mitra.supirs || []).map((supir) => ({
      ...supir,
      mitraNama: mitra.nama,
    })),
  );

  const showPreview = (path) => {
    setPreviewFoto(getImageUrl(path));
    onPreviewOpen();
  };

  const showSuccess = (message) => {
    toast({
      title: "Berhasil",
      description: message,
      status: "success",
      duration: 4000,
      isClosable: true,
    });
    fetchDataMitra();
  };

  const showError = (err) => {
    toast({
      title: "Gagal",
      description: err.response?.data?.error || err.message,
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  };

  const mitraSchema = Yup.object({
    nama: Yup.string().required("Nama wajib diisi"),
    alamat: Yup.string().required("Alamat wajib diisi"),
    npwp: Yup.string().required("NPWP wajib diisi"),
    kontak: Yup.string().required("Kontak wajib diisi"),
    penanggungJawab: Yup.string().required("Penanggung jawab wajib diisi"),
    kode: Yup.string().required("Kode wajib diisi"),
  });

  const transportirSchema = Yup.object({
    plat: Yup.string().required("Plat nomor wajib diisi"),
    kapasitas: Yup.number()
      .typeError("Kapasitas harus angka")
      .positive("Kapasitas harus lebih dari 0")
      .required("Kapasitas wajib diisi"),
    jenisTransportirId: Yup.string().required(
      "Jenis transportir wajib dipilih",
    ),
    pic: Yup.mixed().nullable(),
  });

  const supirSchema = Yup.object({
    nama: Yup.string().required("Nama wajib diisi"),
    nik: Yup.string().required("NIK wajib diisi"),
    mitraId: Yup.string().required("Mitra wajib dipilih"),
    ktp: Yup.mixed().nullable(),
    foto: Yup.mixed().nullable(),
  });

  return (
    <LayoutKPBPN>
      <Box bgColor="secondary" pb="40px" px="30px" minH="90vh">
        <Container variant="primary" p="30px" my="30px" minW="1000px">
          <Heading color="kpbpn" mb={6}>
            Daftar Mitra KPBPN
          </Heading>

          {/* Mitra */}
          <Box mb={10}>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="kpbpn">
                Mitra
              </Heading>
              <Button variant="primary" onClick={onMitraOpen}>
                + Tambah Mitra
              </Button>
            </HStack>
            <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>No</Th>
                    <Th>Kode</Th>
                    <Th>Nama</Th>
                    <Th>Alamat</Th>
                    <Th>NPWP</Th>
                    <Th>Kontak</Th>
                    <Th>Penanggung Jawab</Th>
                    <Th>Jumlah Supir</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataMitra.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={6}>
                        Belum ada data mitra
                      </Td>
                    </Tr>
                  ) : (
                    dataMitra.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{index + 1}</Td>
                        <Td>{item.kode}</Td>
                        <Td>{item.nama}</Td>
                        <Td>{item.alamat}</Td>
                        <Td>{item.npwp}</Td>
                        <Td>{item.kontak}</Td>
                        <Td>{item.penanggungJawab}</Td>
                        <Td>
                          <Badge colorScheme="orange">
                            {(item.supirs || []).length} supir
                          </Badge>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>

          <Divider my={8} />

          {/* Transportir */}
          <Box mb={10}>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="kpbpn">
                Transportir
              </Heading>
              <Button variant="primary" onClick={onTransportirOpen}>
                + Tambah Transportir
              </Button>
            </HStack>
            <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>No</Th>
                    <Th>Plat Nomor</Th>
                    <Th>Kapasitas</Th>
                    <Th>Jenis</Th>
                    <Th>Foto</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataTransportir.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={6}>
                        Belum ada data transportir
                      </Td>
                    </Tr>
                  ) : (
                    dataTransportir.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{index + 1}</Td>
                        <Td>{item.plat}</Td>
                        <Td>{item.kapasitas}</Td>

                        <Td>{item?.jenisTransportir?.jenis}</Td>
                        <Td>
                          {item.foto ? (
                            <Image
                              src={getImageUrl(item.foto)}
                              alt={item.plat}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => showPreview(item.foto)}
                            />
                          ) : (
                            "-"
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>

          <Divider my={8} />

          {/* Supir */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="kpbpn">
                Supir
              </Heading>
              <Button
                variant="primary"
                onClick={onSupirOpen}
                isDisabled={dataMitra.length === 0}
              >
                + Tambah Supir
              </Button>
            </HStack>
            <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>No</Th>
                    <Th>Nama</Th>
                    <Th>NIK</Th>
                    <Th>Mitra</Th>
                    <Th>KTP</Th>
                    <Th>Foto</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allSupir.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={6}>
                        Belum ada data supir
                      </Td>
                    </Tr>
                  ) : (
                    allSupir.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{index + 1}</Td>
                        <Td>{item.nama}</Td>
                        <Td>{item.nik}</Td>
                        <Td>{item.mitraNama}</Td>
                        <Td>
                          {item.ktp ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => showPreview(item.ktp)}
                            >
                              Lihat KTP
                            </Button>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.foto ? (
                            <Image
                              src={getImageUrl(item.foto)}
                              alt={item.nama}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => showPreview(item.foto)}
                            />
                          ) : (
                            "-"
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Modal Tambah Mitra */}
      <Modal isOpen={isMitraOpen} onClose={onMitraClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Mitra</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              nama: "",
              alamat: "",
              npwp: "",
              kontak: "",
              penanggungJawab: "",
              kode: "",
            }}
            validationSchema={mitraSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await axios.post(`${API_BASE}/mitra/post`, values);
                showSuccess("Mitra berhasil ditambahkan");
                resetForm();
                onMitraClose();
              } catch (err) {
                showError(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting, handleChange, handleBlur }) => (
              <Form>
                <ModalBody>
                  <VStack spacing={4}>
                    {[
                      { name: "kode", label: "Kode" },
                      { name: "nama", label: "Nama Mitra" },
                      { name: "alamat", label: "Alamat" },
                      { name: "npwp", label: "NPWP" },
                      { name: "kontak", label: "Kontak" },
                      { name: "penanggungJawab", label: "Penanggung Jawab" },
                    ].map((field) => (
                      <FormControl
                        key={field.name}
                        isInvalid={touched[field.name] && errors[field.name]}
                      >
                        <FormLabel>{field.label}</FormLabel>
                        <Input
                          name={field.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <FormErrorMessage>
                          {errors[field.name]}
                        </FormErrorMessage>
                      </FormControl>
                    ))}
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onMitraClose}>
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Simpan
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Transportir */}
      <Modal isOpen={isTransportirOpen} onClose={onTransportirClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Transportir</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              plat: "",
              kapasitas: "",
              jenisTransportirId: "",
              pic: null,
              picPreview: null,
            }}
            validationSchema={transportirSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const formData = new FormData();
                formData.append("plat", values.plat);
                formData.append("kapasitas", values.kapasitas);
                formData.append(
                  "jenisTransportirId",
                  values.jenisTransportirId,
                );
                if (values.pic) formData.append("pic", values.pic);

                await axios.post(
                  `${API_BASE}/mitra/post/transportir`,
                  formData,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  },
                );
                showSuccess("Transportir berhasil ditambahkan");
                resetForm();
                onTransportirClose();
              } catch (err) {
                showError(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <ModalBody>
                  <VStack spacing={4}>
                    <FormControl isInvalid={touched.plat && errors.plat}>
                      <FormLabel>Plat Nomor</FormLabel>
                      <Input
                        name="plat"
                        value={values.plat}
                        onChange={(e) => setFieldValue("plat", e.target.value)}
                      />
                      <FormErrorMessage>{errors.plat}</FormErrorMessage>
                    </FormControl>
                    <FormControl
                      isInvalid={touched.kapasitas && errors.kapasitas}
                    >
                      <FormLabel>Kapasitas</FormLabel>
                      <Input
                        name="kapasitas"
                        type="number"
                        value={values.kapasitas}
                        onChange={(e) =>
                          setFieldValue("kapasitas", e.target.value)
                        }
                      />
                      <FormErrorMessage>{errors.kapasitas}</FormErrorMessage>
                    </FormControl>
                    <FormControl
                      isInvalid={
                        touched.jenisTransportirId && errors.jenisTransportirId
                      }
                    >
                      <FormLabel>Jenis Transportir</FormLabel>
                      <Select
                        placeholder="Pilih jenis transportir"
                        value={values.jenisTransportirId}
                        onChange={(e) =>
                          setFieldValue("jenisTransportirId", e.target.value)
                        }
                      >
                        {dataJenisTransportir.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.jenis}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>
                        {errors.jenisTransportirId}
                      </FormErrorMessage>
                    </FormControl>

                    <FileUploadField
                      label="Foto Kendaraan"
                      name="pic"
                      preview={values.picPreview}
                      touched={touched.pic}
                      error={errors.pic}
                      onChange={(file) => {
                        setFieldValue("pic", file);
                        setFieldValue(
                          "picPreview",
                          file ? URL.createObjectURL(file) : null,
                        );
                      }}
                    />
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onTransportirClose}>
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Simpan
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Supir */}
      <Modal isOpen={isSupirOpen} onClose={onSupirClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Supir</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              nama: "",
              nik: "",
              mitraId: "",
              ktp: null,
              foto: null,
              ktpPreview: null,
              fotoPreview: null,
            }}
            validationSchema={supirSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const formData = new FormData();
                formData.append("nama", values.nama);
                formData.append("nik", values.nik);
                formData.append("mitraId", values.mitraId);
                if (values.ktp) formData.append("ktp", values.ktp);
                if (values.foto) formData.append("foto", values.foto);

                await axios.post(`${API_BASE}/mitra/post/supir`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                showSuccess("Supir berhasil ditambahkan");
                resetForm();
                onSupirClose();
              } catch (err) {
                showError(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <ModalBody>
                  <VStack spacing={4}>
                    <FormControl isInvalid={touched.nama && errors.nama}>
                      <FormLabel>Nama Supir</FormLabel>
                      <Input
                        name="nama"
                        value={values.nama}
                        onChange={(e) => setFieldValue("nama", e.target.value)}
                      />
                      <FormErrorMessage>{errors.nama}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.nik && errors.nik}>
                      <FormLabel>NIK</FormLabel>
                      <Input
                        name="nik"
                        value={values.nik}
                        onChange={(e) => setFieldValue("nik", e.target.value)}
                      />
                      <FormErrorMessage>{errors.nik}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.mitraId && errors.mitraId}>
                      <FormLabel>Mitra</FormLabel>
                      <Select
                        placeholder="Pilih mitra"
                        value={values.mitraId}
                        onChange={(e) =>
                          setFieldValue("mitraId", e.target.value)
                        }
                      >
                        {dataMitra.map((mitra) => (
                          <option key={mitra.id} value={mitra.id}>
                            {mitra.kode} - {mitra.nama}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.mitraId}</FormErrorMessage>
                    </FormControl>
                    <FileUploadField
                      label="Foto KTP"
                      name="ktp"
                      preview={values.ktpPreview}
                      touched={touched.ktp}
                      error={errors.ktp}
                      onChange={(file) => {
                        setFieldValue("ktp", file);
                        setFieldValue(
                          "ktpPreview",
                          file ? URL.createObjectURL(file) : null,
                        );
                      }}
                    />
                    <FileUploadField
                      label="Foto Supir"
                      name="foto"
                      preview={values.fotoPreview}
                      touched={touched.foto}
                      error={errors.foto}
                      onChange={(file) => {
                        setFieldValue("foto", file);
                        setFieldValue(
                          "fotoPreview",
                          file ? URL.createObjectURL(file) : null,
                        );
                      }}
                    />
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onSupirClose}>
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Simpan
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>

      {/* Modal Preview Foto */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview Foto</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {previewFoto && (
              <Image
                src={previewFoto}
                alt="Preview"
                w="100%"
                maxH="70vh"
                objectFit="contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutKPBPN>
  );
};

export default DaftarMitra;
