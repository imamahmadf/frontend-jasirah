import React, { useState, useEffect } from "react";
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
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { BsCaretRightFill } from "react-icons/bs";
import { BsCaretLeftFill } from "react-icons/bs";
import { BsEyeFill } from "react-icons/bs";
import { BsPencilFill } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function DaftarPerjalanan() {
  const [dataPegawai, setDataPegawai] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [keyword, setKeyword] = useState("");
  const [alfabet, setAlfabet] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [dataSeed, setDataSeed] = useState([]);
  const [time, setTime] = useState("");
  const [pangkatId, setPangkatId] = useState(0);
  const [golonganId, setGolonganId] = useState(0);
  const [tingkatanId, setTingkatanId] = useState(0);
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const token = localStorage.getItem("token");

  function inputHandler(event) {
    const tes = setTimeout(() => {
      //console.log(event.target.value);
      const { value } = event.target;

      setKeyword(value);
    }, 2000);
  }
  async function fetchSeed() {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get/seed`)
      .then((res) => {
        setDataSeed(res.data);
        console.log(res.data, "DATASEEED");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataPegawai() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/daftar?search_query=${keyword}&alfabet=${alfabet}&time=${time}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
        setDataPegawai(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "nama") {
      setNama(val);
    } else if (field == "nip") {
      setNip(val);
    } else if (field == "jabatan") {
      setJabatan(val);
    }
  };
  useEffect(() => {
    fetchDataPegawai();
    fetchSeed();
  }, [page, keyword]);
  return (
    <Layout>
      <Box pb={"40px"} px={"30px"}>
        <Container variant={"primary"} maxW={"2880px"} p={"30px"}>
          <Flex mb={"30px"}>
            <Box>
              <FormControl>
                <Input
                  onChange={inputHandler}
                  type="name"
                  placeholder="Cari Pegawai"
                  borderRadius="5px"
                  borderColor="rgba(175, 175, 175, 1)"
                  width={"500px"}
                />{" "}
              </FormControl>
            </Box>
          </Flex>
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>nama</Th> <Th>NIP</Th> <Th>Pangkat</Th> <Th>Gol.</Th>
                <Th>Jabatan</Th> <Th>Tingkatan</Th> <Th>Unit Kerja</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataPegawai?.result?.map((item, index) => (
                <Tr>
                  <Td>{item.nama}</Td>
                  <Td minWidth={"200px"}>{item.nip}</Td>
                  <Td>{item.daftarPangkat.pangkat}</Td>
                  <Td>{item.daftarGolongan.golongan}</Td>
                  <Td>{item.jabatan}</Td>
                  <Td>{item.daftarTingkatan.tingkatan}</Td>
                  <Td>{item?.daftarUnitKerja?.unitKerja}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Button
                        variant={"primary"}
                        p={"0px"}
                        fontSize={"14px"}
                        onClick={() =>
                          history.push(`/admin/detail-pegawai/${item.id}`)
                        }
                      >
                        <BsEyeFill />
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>{" "}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              boxSizing: "border-box",
              width: "100%",
              height: "100%",
            }}
          >
            <ReactPaginate
              previousLabel={<BsCaretLeftFill />}
              nextLabel={<BsCaretRightFill />}
              pageCount={pages}
              onPageChange={changePage}
              activeClassName={"item active "}
              breakClassName={"item break-me "}
              breakLabel={"..."}
              containerClassName={"pagination"}
              disabledClassName={"disabled-page"}
              marginPagesDisplayed={2}
              nextClassName={"item next "}
              pageClassName={"item pagination-page "}
              pageRangeDisplayed={2}
              previousClassName={"item previous"}
            />
          </div>
        </Container>
      </Box>
    </Layout>
  );
}

export default DaftarPerjalanan;
