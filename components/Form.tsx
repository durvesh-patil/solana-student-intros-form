import { FC } from "react";
import { StudentIntro } from "../models/StudentIntro";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";

const STUDENT_INTRO_PROGRAM_ID = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

export const Form: FC = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const studentIntro = new StudentIntro(name, message);
    handleTransactionSubmit(studentIntro);
  };

  const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
    if (!publicKey) {
      alert("Plz connect your wallet");
      return;
    }

    const transaction = new web3.Transaction();
    const buffer = studentIntro.serialize();

    const [pda] = await web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer()],
      new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID)
    );

    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
    });

    transaction.add(instruction);

    try {
      let txid = await sendTransaction(transaction, connection);
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (e) {
      alert(JSON.stringify(e));
      console.log(e);
    }
  };

  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      borderWidth={1}
      margin={2}
      justifyContent="center"
    >
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">What do we call you?</FormLabel>
          <Input
            id="name"
            color="gray.400"
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">
            What brings you to Solana, friend?
          </FormLabel>
          <Textarea
            id="message"
            color="gray.400"
            onChange={(event: any) => setMessage(event.currentTarget.value)}
          />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};
