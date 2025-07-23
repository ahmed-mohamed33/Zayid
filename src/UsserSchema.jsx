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
          console.log("All Schema Data:", fullData);
        } else {
          console.log("No data found in the database.");
        }
      })
      .catch((error) => {
        console.error("Error fetching full data:", error);
      });
  }, []);

  return;
};

export default AllDataComponent;
