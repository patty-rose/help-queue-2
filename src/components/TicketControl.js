import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from './../firebase.js'

//updateDoc() will allow us to update a document in Firestore.
// deleteDoc() will allow us to delete documents in Firestore.
// doc() will allow us to reference a document in the firestore database. With doc(), we can specify the location of a new document or the location of an existing document.

function TicketControl() {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     formVisibleOnPage: false,
  //     mainTicketList: [],
  //     selectedTicket: null,
  //     editing: false
  //   };
  // }

  //state slice hooks:
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);

  const [mainTicketList, setMainTicketList] = useState([]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  const [error, setError] = useState(null);//for useEffect error handling

  //useEffect hook:
  useEffect(() => {
    //We return a cleanup function for the useEffect() hook to run. useEffect() will call this function when the TicketControl component unmounts, and it will unsubscribe our database listener; by "unsubscribe", we mean to stop the listener. 
    const unSubscribe = onSnapshot(//onSnapshot takes 3 arguments: doc or collection reference taht we want our listener to listen to, callback func to handle successful requests, and callback func to handle errors.
      collection(db, "tickets"), //we're listening for changes to the tickets collection.
      (collectionSnapshot) => {
        const tickets = [];
        collectionSnapshot.forEach((doc) => {
            tickets.push({
              names: doc.data().names, 
              location: doc.data().location, 
              issue: doc.data().issue, 
              id: doc.id
            });
        });
        setMainTicketList(tickets);//we're looping through the collection of returned ticket documents to construct an array of JavaScript ticket objects. When we've finished constructing the array, we call setMainTicketList() to update the mainTicketList state variable with the array of tickets.
      },
      (error) => {
        setError(error.message);
      }
    );

    return () => unSubscribe();//The onSnapshot() function returns a function that we can call at any point to stop the listener. We save this returned function in a variable called unSubscribe. We could call this variable anything, like stop or clearListener.

  }, []);//We've passed in an empty array as the second argument, which means our effect will run once after our component's first render. Just like with event listeners, we only want to create our Firestore database listener once.
  // In terms of Firestore object types, this parameter is a QuerySnapshot object that's made up of one or more DocumentSnapshot objects. Each of these object types have their own properties and methods. This is important to note, because when we call collectionSnapshot.forEach(...), we're actually calling a QuerySnapshot method, and not JavaScript's Array.prototype.forEach() method. However, QuerySnapshot has a handy docs property that returns an array of the collection's data. That means we can call any JavaScript array method on collectionSnapshot.docs. Here's an example of using Array.prototype.map() instead of Array.prototype.forEach():

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, "tickets", id));
    setSelectedTicket(null);
  } 

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    const ticketRef = doc(db, "tickets", ticketToEdit.id);
    await updateDoc(ticketRef, ticketToEdit);
    setEditing(false);
    setSelectedTicket(null);
  }
  // }First, we create a document reference with the doc() function for the ticket that we want to update:
  // The doc() function takes 3 arguments: the database instance, the collection name, and the unique document identifier.
  // The doc() function returns a DocumentReference object, which as its name suggests, is an object that acts as a reference to a document within our Firestore database.
  // Next, we call the updateDoc() function. The first argument we pass into this function is the document reference for the ticket we want to update, and the second argument is the new data that the ticket should be updated with.
  // Finally, take note that the updateDoc() function is asynchronous, so we need to make our handleEditingTicketInList() function async and and apply the await keyword before the updateDoc() function call.

  const handleAddingNewTicketToList = async (newTicketData) => { //async process to access firestore db
    await addDoc(collection(db, "tickets"), newTicketData);//The collection() function allows us to specify a collection within our firestore database. This function takes two arguments: the Firestore database instance, and the name of our collection. This function returns a CollectionReference object, which as its name suggests, is an object that acts as a reference to a collection within our Firestore database.
    //The addDoc() function allows us to add a new document to a specified collection. This function takes two arguments: a collection reference and the data to be added to the new document.
    setFormVisibleOnPage(false);
  }
  // const handleAddingNewTicketToList = (newTicket) => {
  //   const newMainTicketList = mainTicketList.concat(newTicket);
  //   setMainTicketList(newMainTicketList);
  //   setFormVisibleOnPage(false)
  // }

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }

  if (auth.currentUser == null) {
    return (
      <React.Fragment>
        <h1>You must be signed in to access the queue.</h1>
      </React.Fragment>
    )
  } else if (auth.currentUser != null) {
    let currentlyVisibleState = null;
    let buttonText = null; 

    if (error) {
      currentlyVisibleState = <p>There was an error: {error}</p>
    } else if (editing) {      
      currentlyVisibleState = 
        <EditTicketForm 
          ticket = {selectedTicket} 
          onEditTicket = {handleEditingTicketInList} />;
      buttonText = "Return to Ticket List";
    } else if (selectedTicket != null) {
      currentlyVisibleState = 
        <TicketDetail 
          ticket={selectedTicket} 
          onClickingDelete={handleDeletingTicket}
          onClickingEdit = {handleEditClick} />;
      buttonText = "Return to Ticket List";
    } else if (formVisibleOnPage) {
      currentlyVisibleState = 
        <NewTicketForm 
          onNewTicketCreation={handleAddingNewTicketToList}/>;
      buttonText = "Return to Ticket List"; 
    } else {
      currentlyVisibleState = 
        <TicketList 
          onTicketSelection={handleChangingSelectedTicket} 
          ticketList={mainTicketList} />;
      buttonText = "Add Ticket"; 
    }

    return (
      <React.Fragment>
        {currentlyVisibleState}
        {error ? null : <button onClick={handleClick}>{buttonText}</button>}
      </React.Fragment>
    );
  }
}

export default TicketControl;