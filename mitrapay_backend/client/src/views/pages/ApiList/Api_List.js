import React from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa';

const Api_List = () => {
    const creators = [
    { name: 'S TEST ACCOUNT', username: 'stestac', email: 'stestac@gmail.com' },
    { name: 'Sky', username: 'sky', email: 'skyoc@gmail.com' },
    { name: '1x', username: '1x', email: '1xoc@gmail.com' },
    { name: 'Ganeshoc', username: 'gnoc', email: 'gnoc@gmail.com' },
    { name: 'pd25', username: 'pd25', email: 'pd25@gmail.com' },
    { name: 'pd24', username: 'pd24', email: 'pd24@gmail.com' },
    { name: 'pd23', username: 'pd23', email: 'pd23@gmail.com' },
    { name: 'pd22', username: 'pd22', email: 'pd22@gmail.com' },
    { name: 'pd21', username: 'pd21', email: 'pd21@gmail.com' }
  ];
  return (
    <div className="container mt-5">
       
       <div className="d-flex justify-content-between align-items-center mb-4">
         <h2 className="fw-semibold">Api list </h2>
         <Link as={Link} to="/apilist/create" className="btn btn-primary">
           <FaPlus className="me-2" />
           New Order Creator
         </Link>
       </div>
 
       <div className="row mb-3">
         <div className="col-md-6 mb-2">
           <div className="input-group">
             <span className="input-group-text bg-white border-end-0">
               <FaSearch />
             </span>
             <input
               type="text"
               className="form-control border-start-0"
               placeholder="Search"
             />
           </div>
         </div>
         <div className="col-md-3">
           <select className="form-select">
             <option>Website: All</option>
             {/* Add dynamic options if needed */}
           </select>
         </div>
       </div>
 
       <div className="table-responsive">
         <table className="table table-hover align-middle">
           <thead>
             <tr>
               <th>Name</th>
               <th>User Name</th>
               <th>Email</th>
               <th>Status</th>
               <th>Action</th>
             </tr>
           </thead>
           <tbody>
             {creators.map((user, index) => (
               <tr key={index}>
                 <td>{user.name}</td>
                 <td>{user.username}</td>
                 <td>{user.email}</td>
                 <td>
                   <span className="badge bg-light text-success d-inline-flex align-items-center gap-1">
                     <span
                       className="bg-success rounded-circle d-inline-block"
                       style={{ width: '8px', height: '8px' }}
                     ></span>
                     Active
                   </span>
                 </td>
                 <td>
                   <FaEdit className="text-muted cursor-pointer" />
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
  )
}

export default Api_List
