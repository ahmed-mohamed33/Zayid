import React, { useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "./config/Firebase";

const AllDataComponent = () => {
  useEffect(() => {
    const dbRef = ref(database);
    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const fullData = snapshot.val();
          } else {
          }
      })
      .catch((error) => {
        });
  }, []);

  return;
};

export default AllDataComponent;

