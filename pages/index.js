import { Container } from '@mantine/core';
import { Flex,  Space, Button, Stack, Card, Image, Text, Badge,  Group, Grid, Menu, Checkbox, TextInput, Center, Popover} from '@mantine/core';
import { ActionIcon } from '@mantine/core';
import { IconAdjustments, IconSettings, IconFilter, IconSearch, IconPhoto, IconMessageCircle, IconTrash, IconEdit, IconArrowsLeftRight, IconCalendar, IconClose  } from '@tabler/icons';

import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

import { collection, addDoc,getDocs, runTransaction, doc, deleteDoc, query, where, onSnapshot, orderBy  } from "firebase/firestore"; 

import { useState, useEffect } from 'react';

import { Calendar } from '@mantine/dates';


function HomePage() {


    const firebaseConfig = {

        apiKey: "AIzaSyCNd-c2ikDMBDMHDP-SfelK6yGvrTnqgtE",
      
        authDomain: "llogixit-server-7b834.firebaseapp.com",
      
        databaseURL: "https://llogixit-server-7b834-default-rtdb.asia-southeast1.firebasedatabase.app",
      
        projectId: "llogixit-server-7b834",
      
        storageBucket: "llogixit-server-7b834.appspot.com",
      
        messagingSenderId: "544926125135",
      
        appId: "1:544926125135:web:fb8192b6fc3841b6c46e3a",
      
        measurementId: "G-4WDSTJ72GB"
      
      };
      
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
console.log(db);

const [value, setValue] = useState(null);


const [tasks,setTasks] = useState([]);
const [searchResults,setSearchResults] = useState([]);
const [selectedID, setSelectedID] = useState();
const [done,setDone] = useState(false);
const [currentText,setCurrentText] = useState("");
const [currentText1,setCurrentText1] = useState("");
const [calendarOpen, setCalendarOpen] = useState(false);
const [calendarDate,setCalendarDate] = useState("");
const [calendarAction, setCalendarAction] = useState("");


const updateItem = (id, ie)=>{

    setSelectedID(id);

    setTasks(current=>
        current.map(obj => {
            if(obj.id===id){
                setCurrentText(obj.text);
        return {
            ...obj, isEdit:ie
        }; 
            }

        return obj;
        })

    );


}

 
const search = () => { 
    setSearchResults([]);
const q1 = query(collection(db, "tasks"), where("dueDate", "==", calendarDate));

let tmp = [];
const unsubscribe = onSnapshot(q1, (querySnapshot) => {
  const cities = [];
  querySnapshot.forEach((doc) => {

    tmp.push({id:doc.id,text:doc.data().text,isEdit:false});

  });

  setTasks(tmp);

});

}

const searchByText = (e)=>{
    setSearchResults([]);
    let tmp = []
    tasks.forEach((doc) => {
        if(doc.text.includes(e.target.value)){
        tmp.push(doc);
        }
    });
    setSearchResults(tmp);
}


const sortAlphabetically = () => { 
    setSearchResults([]);
    const q1 = query(collection(db, "tasks"),  orderBy("text") );
    
    let tmp = [];
    const unsubscribe = onSnapshot(q1, (querySnapshot) => {
      const cities = [];
      querySnapshot.forEach((doc) => {
    
        tmp.push({id:doc.id,text:doc.data().text,isEdit:false});
    
      });
    
      setTasks(tmp);
    
    });
    
    }




const openCalendar = (e)=>{
    setCalendarAction(e);
    setCalendarOpen(!calendarOpen);
}

const doCalendarAction = (e)=>{
    if(calendarAction=="search"){
       search();
    }
    if(calendarAction=="toadd"){

    }
 
    setCalendarOpen(!calendarOpen)

}


const deleteTask = async(id) =>{
    await deleteDoc(doc(db, "tasks", id));
    
    reloadTask();
}


const reloadTask = async(e)=>{

let tmp = [];

const querySnapshot = await getDocs(collection(db, "tasks"));
querySnapshot.forEach((doc) => {

tmp.push({id:doc.id,text:doc.data().text,isEdit:false});

 
});

setTasks(tmp);
setCurrentText1("");
   
}


const isEditorNot = (id, ie,text)=>{

    let html = "";

    if(!ie){
        if(currentText1!="" && selectedID==id){
            html =   <Checkbox label={currentText1}/>   ;
        }

        else{
            html =   <Checkbox label={text}
            />   ;
        }
    }

    else{
        html = <TextInput value={currentText} onChange={(e)=>setCurrentText(e.target.value)} onClick={()=>setSelectedID(id)} onKeyDown={updateTask}
        />;
    }

    return html;

}


const addTask = async (e) => {

if(e.key=="Enter"){

try {
  const docRef = await addDoc(collection(db, "tasks"), {
    text: e.target.value,
    dueDate: calendarDate
  });

  e.target.value = "";


  reloadTask();

  console.log("Document written with ID: ", docRef.id);


} catch (e) {
  console.error("Error adding document: ", e);
}
}

}


useEffect(()=>{

    reloadTask();
},[]);



const updateTask = async (e)=>{

if(e.key=="Enter"){
    // Create a reference to the SF doc.
const sfDocRef = doc(db, "tasks", selectedID);

try {

  const newPopulation = await runTransaction(db, async (transaction) => {

    const sfDoc = await transaction.get(sfDocRef);

    if (!sfDoc.exists()) {
      throw "Document does not exist!";
    }

    const newPop = sfDoc.data().text;
    
    transaction.update(sfDocRef, { text:  e.target.value});
    
  });
  
  setCurrentText1(currentText);
  updateItem(selectedID,false);
  reloadTask();


  setTimeout(function(){
  
  },3000);
  
  console.log("Population increased to ", newPopulation);
} catch (e) {
  // This will be a "population is too big" error.
  console.error(e);
}
}
}

const getItems = ()=>{
    let items = tasks;
    if(searchResults.length>0){
        items = searchResults;
    }
    return items;
}


    return (
        <>



          <Container>

      <Popover opened={calendarOpen} width={300} height={300} position="top" withArrow shadow="md">
     
     <Popover.Target>
        
 
  


          <Grid gutter={5} gutterXs="md" gutterMd="xl" gutterXl={50}>
            
      <Grid.Col span={2}>Tasks App</Grid.Col>
       
      <Grid.Col span={10}>  
      
      

      
        <Flex>   


<TextInput label="" placeholder="Search" onChange={(e)=>searchByText(e)} icon={<IconSearch size={14} />} />


             <Menu shadow="md" width={200}>
      <Menu.Target>
      <ActionIcon variant="transparent"><IconFilter size={24} /></ActionIcon>


      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Sort by</Menu.Label>
        <Menu.Divider />
     
        
 
        <Menu.Item onClick={()=>openCalendar("search")} icon={<IconMessageCircle size={14} />}>Due Date</Menu.Item>
      
 
        <Menu.Item onClick={()=>sortAlphabetically()} icon={<IconPhoto size={14} />}>Alpabetically</Menu.Item>
    
    
   
      </Menu.Dropdown>
    </Menu>
   
        </Flex>
    </Grid.Col>
    </Grid>
         

    </Popover.Target>

<Popover.Dropdown>

  <Calendar value={calendarDate} onChange={setCalendarDate} />
  <Grid gutter={5} gutterXs="md" gutterMd="xl" gutterXl={50}>
<Grid.Col span={10}>
    </Grid.Col>

    <Grid.Col><ActionIcon onClick={()=>doCalendarAction()}variant="transparent">
{calendarAction=="search" && 
<IconSearch size={24} />
}


</ActionIcon></Grid.Col>
</Grid>

 
        </Popover.Dropdown>
      </Popover>
    
          </Container>



        <Space h="md" />
    
          <Container size="xs" px="xs">


          <Stack sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]})}>
         
          <Card shadow="sm" p="lg" radius="md" withBorder>
       
          <Card.Section>  

      <Grid>
      <Grid.Col span={1}>  </Grid.Col>
      <Grid.Col span={9}>  
      <TextInput readOnly={selectedID!="" && true} onClick={()=>setSelectedID("")} onKeyDown={addTask}
    />
  </Grid.Col>
    </Grid>   
      </Card.Section>

     



      <Grid gutter={2} gutterXs="md" gutterMd="xl" gutterXl={2}>
      <Grid.Col span={2}>  

      <ActionIcon onClick={()=>openCalendar("toadd")}variant="transparent">

        <IconCalendar size={24} />

        </ActionIcon>

  

      </Grid.Col>
        
      </Grid>
  
      </Card>
   

        {Array.from(getItems()).map((_,index)=>(

   
      <Card shadow="sm" p="lg" radius="md" withBorder>
      
      <Card.Section>
      <Grid gutter={2} gutterXs="md" gutterMd="xl" gutterXl={2}>
      <Grid.Col span={1}>  </Grid.Col>
      <Grid.Col span={9}>  
      
    {isEditorNot(_.id, _.isEdit,_.text)}
    
    </Grid.Col>
    </Grid>
      </Card.Section>
     
      <Grid gutter={2} gutterXs="md" gutterMd="xl" gutterXl={2}>
      <Grid.Col span={2}>  
      <Flex>
      <ActionIcon variant="transparent">
        <IconEdit onClick={()=>updateItem(_.id, !_.isEdit)} size={24} /></ActionIcon>
        <ActionIcon variant="transparent">
        <IconTrash onClick={()=>deleteTask(_.id)} size={24} /></ActionIcon>
        </Flex>
      </Grid.Col>
        
      </Grid>


      </Card>))

}





    </Stack>
           </Container>
    
        </>
      );
 }

 export default HomePage