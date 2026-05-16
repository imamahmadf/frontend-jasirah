import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
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
  FormErrorMessage,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Textarea,
  Input,
  Spacer,
  Switch,
  Spinner,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import Loading from "../../Componets/Loading";
import { register } from "../../Redux/Reducers/auth";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";

function TambahUser() {
  const [dataPegawai, setDataPegawai] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const history = useHistory();
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [dataRole, setDataRole] = useState(null);

  const initialValues = {
    pegawai: null,
    nama: "",
    pegawaiId: null,
    role: null,
    unitKerja: null,
    unitKerjaId: null,
    namaPengguna: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    pegawai: Yup.mixed().nullable().required("Nama Pegawai wajib dipilih"),
    nama: Yup.string().required("Nama wajib diisi"),
    pegawaiId: Yup.mixed().nullable().required("Pegawai wajib dipilih"),
    role: Yup.mixed().nullable().required("Role wajib dipilih"),
    unitKerja: Yup.mixed().nullable().required("Unit Kerja wajib dipilih"),
    unitKerjaId: Yup.mixed().nullable().required("Unit Kerja wajib dipilih"),
    namaPengguna: Yup.string()
      .required("Nama Pengguna wajib diisi")
      .min(3, "Nama Pengguna minimal 3 karakter"),
    password: Yup.string()
      .required("Kata Sandi wajib diisi")
      .min(6, "Kata Sandi minimal 6 karakter"),
  });

  async function fetchRole() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/get-role`
      );
      setDataUnitKerja(res.data.resultUnitKerja);
      setDataRole(res.data.result);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`
      );
      setDataPegawai(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDataPegawai(), fetchRole()]);
    };
    fetchData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const roleId = values.role?.value?.id || values.role?.id || values.role;
      await dispatch(
        register(
          values.nama,
          values.password,
          values.namaPengguna,
          roleId,
          values.unitKerjaId,
          values.pegawaiId
        )
      );
      history.push("/admin/daftar-user");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} minH={"90vh"} pb={"40px"} px={"30px"}>
        <Container variant={"primary"} maxW={"1280px"} p={"30px"}>
          {isLoading ? (
            <Loading />
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form>
                  <FormControl
                    my={"30px"}
                    isInvalid={!!errors.pegawai && touched.pegawai}
                  >
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

                          const filtered = res.data.result.filter(
                            (val) =>
                              val.statusPegawaiId === 3 ||
                              val.statusPegawaiId === 4
                          );
                          return filtered.map((val) => ({
                            value: val,
                            label: val.nama,
                          }));
                        } catch (err) {
                          console.error("Failed to load options:", err.message);
                          return [];
                        }
                      }}
                      placeholder="Ketik Nama Pegawai"
                      value={values.pegawai}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setFieldValue("pegawai", selectedOption);
                          setFieldValue("nama", selectedOption.value.nama);
                          setFieldValue("pegawaiId", selectedOption.value.id);

                          // Otomatis isi nama pengguna dengan NIK (hapus spasi)
                          if (selectedOption.value.nik) {
                            setFieldValue(
                              "namaPengguna",
                              selectedOption.value.nik.replace(/\s+/g, "")
                            );
                          }

                          // Otomatis isi unit kerja dengan unitKerjaId dari pegawai
                          if (
                            selectedOption.value.unitKerjaId &&
                            dataUnitKerja
                          ) {
                            const unitKerja = dataUnitKerja.find(
                              (uk) => uk.id === selectedOption.value.unitKerjaId
                            );
                            if (unitKerja) {
                              setFieldValue("unitKerjaId", unitKerja.id);
                              setFieldValue("unitKerja", {
                                value: unitKerja,
                                label: unitKerja.unitKerja,
                              });
                            }
                          }
                        } else {
                          setFieldValue("pegawai", null);
                          setFieldValue("nama", "");
                          setFieldValue("pegawaiId", null);
                          setFieldValue("namaPengguna", "");
                          setFieldValue("unitKerjaId", null);
                          setFieldValue("unitKerja", null);
                        }
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
                    <FormErrorMessage>{errors.pegawai}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    isInvalid={!!errors.role && touched.role}
                  >
                    <FormLabel fontSize={"24px"}>Role</FormLabel>
                    <Select2
                      options={dataRole?.map((val) => ({
                        value: val,
                        label: `${val.nama}`,
                      }))}
                      placeholder="Cari Role"
                      focusBorderColor="red"
                      value={values.role}
                      onChange={(selectedOption) => {
                        setFieldValue("role", selectedOption);
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
                    <FormErrorMessage>{errors.role}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    isInvalid={!!errors.unitKerja && touched.unitKerja}
                  >
                    <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                    <Select2
                      options={dataUnitKerja?.map((val) => ({
                        value: val,
                        label: `${val.unitKerja}`,
                      }))}
                      placeholder="Cari Unit Kerja"
                      focusBorderColor="red"
                      value={values.unitKerja}
                      onChange={(selectedOption) => {
                        setFieldValue("unitKerja", selectedOption);
                        setFieldValue(
                          "unitKerjaId",
                          selectedOption?.value?.id || null
                        );
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
                    <FormErrorMessage>{errors.unitKerja}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    isInvalid={!!errors.namaPengguna && touched.namaPengguna}
                  >
                    <FormLabel fontSize={"24px"}>Nama Pengguna</FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      value={values.namaPengguna}
                      onChange={(e) =>
                        setFieldValue("namaPengguna", e.target.value)
                      }
                      placeholder="Nama Pengguna"
                    />
                    <FormErrorMessage>{errors.namaPengguna}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    my={"30px"}
                    isInvalid={!!errors.password && touched.password}
                  >
                    <FormLabel fontSize={"24px"}>Kata Sandi</FormLabel>
                    <Input
                      type="password"
                      height={"60px"}
                      bgColor={"terang"}
                      value={values.password}
                      onChange={(e) =>
                        setFieldValue("password", e.target.value)
                      }
                      placeholder="kata sandi"
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <Button
                    mt={"30px"}
                    variant={"primary"}
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Menambahkan..."
                  >
                    Tambah +
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Container>
      </Box>
    </Layout>
  );
}

export default TambahUser;
