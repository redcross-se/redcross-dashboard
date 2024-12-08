import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { MdEdit, MdDelete, MdBlock } from "react-icons/md";
import { axiosInstance } from "../../configs/axios.instance";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBanDialog, setOpenBanDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/supervisor/list-users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let tempUsers = [...users];
    if (searchTerm) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter) {
      tempUsers = tempUsers.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(tempUsers);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setOpenEditDialog(true);
  };

  const handleDelete = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleBan = (user) => {
    setCurrentUser(user);
    setOpenBanDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/admin/users/${currentUser.id}`);
      setUsers(users.filter((u) => u.id !== currentUser.id));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const confirmBan = async () => {
    try {
      await axiosInstance.post(`/admin/users/${currentUser.id}/ban`);
      setUsers(
        users.map((u) =>
          u.id === currentUser.id ? { ...u, isBanned: true } : u
        )
      );
      setOpenBanDialog(false);
    } catch (err) {
      console.error("Ban error:", err);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axiosInstance.put(`/admin/users/${currentUser.id}`, currentUser);
      setUsers(users.map((u) => (u.id === currentUser.id ? currentUser : u)));
      setOpenEditDialog(false);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  if (loading) return <Box p={2}>Loading...</Box>;
  if (error) return <Box p={2}>Error: {error}</Box>;

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel id="role-filter-label">Filter by Role</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            label="Filter by Role"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="volunteer">Volunteer</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.isBanned ? "Banned" : "Active"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user)}
                      >
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                    {!user.isBanned && (
                      <Tooltip title="Ban">
                        <IconButton
                          color="secondary"
                          onClick={() => handleBan(user)}
                        >
                          <MdBlock />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>
        {currentUser && (
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Full Name"
                variant="outlined"
                value={currentUser.fullName}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, fullName: e.target.value })
                }
              />
              <TextField
                label="Email"
                variant="outlined"
                type="email"
                value={currentUser.email}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, email: e.target.value })
                }
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                value={currentUser.phoneNumber}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    phoneNumber: e.target.value,
                  })
                }
              />
              <FormControl variant="outlined">
                <InputLabel id="edit-role-label">Role</InputLabel>
                <Select
                  labelId="edit-role-label"
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {currentUser && currentUser.fullName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <Dialog open={openBanDialog} onClose={() => setOpenBanDialog(false)}>
        <DialogTitle>Confirm Ban</DialogTitle>
        <DialogContent>
          Are you sure you want to ban {currentUser && currentUser.fullName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBanDialog(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={confirmBan}>
            Ban
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
