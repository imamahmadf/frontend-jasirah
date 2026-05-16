import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
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
  Th,
  Td,
  Flex,
  Textarea,
  Input,
  Spacer,
  Select,
  Spinner,
} from "@chakra-ui/react";

function TambahBendahara() {
  const [dataPegawai, setDataPegawai] = useState([]);
  const [pegawaiId, setPegawaiId] = useState(0);
  const [dataSumberDana, setDataSumberDana] = useState(null);
  const [sumberDanaId, setSumberDanaId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector(userRedux);
  const [jabatan, setJabatan] = useState("");
  const history = useHistory();

  function renderSumberDana() {
    return dataSumberDana?.map((val) => {
      return (
        <option key={val.id} value={val.id}>
          {val.sumber}
        </option>
      );
    });
  }
  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get`
      );
      setDataPegawai(res.data);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function fetchSumberDana() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/get/sumber-dana/${
          user[0].unitKerja_profile.indukUnitKerja.id
        }`
      );
      setDataSumberDana(res.data.result);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }
  const postBendahara = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/post/bendahara`,
        {
          pegawaiId,
          indukUnitKerjaId: user[0].unitKerja_profile.indukUnitKerja.id,
          jabatan,
          sumberDanaId,
        }
      );
      history.push("/admin/daftar-bendahara");
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDataPegawai(), fetchSumberDana()]);
    };
    fetchData();
  }, []);
  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
                <Select2
                  options={dataPegawai.result?.map((val) => ({
                    value: val,
                    label: `${val.nama}`,
                  }))}
                  placeholder="Cari Nama Pegawai"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setPegawaiId(selectedOption.value.id);
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
              </FormControl>

              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Jabatan</FormLabel>
                <Input
                  height={"60px"}
                  bgColor={"terang"}
                  type="text"
                  border={"none"}
                  onChange={(e) => {
                    setJabatan(e.target.value);
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize={"24px"}>Sumber Dana</FormLabel>
                <Select
                  placeholder="Jenis"
                  height={"60px"}
                  bgColor={"terang"}
                  borderRadius={"8px"}
                  borderColor={"rgba(229, 231, 235, 1)"}
                  onChange={(e) => {
                    setSumberDanaId(parseInt(e.target.value));
                  }}
                >
                  {renderSumberDana()}
                </Select>
              </FormControl>

              <Button
                mt={"30px"}
                onClick={postBendahara}
                isLoading={isSubmitting}
                variant={"primary"}
                loadingText="Menambahkan..."
              >
                Tambahkan
              </Button>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
}

export default TambahBendahara;
