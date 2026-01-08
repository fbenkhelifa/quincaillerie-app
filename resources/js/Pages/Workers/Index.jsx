import { useContext, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    FormControlLabel,
    Switch,
    InputAdornment,
    TablePagination,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function WorkersIndex({ workers, filters }) {
    const { t } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workerToDelete, setWorkerToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        phone: '',
        role: 'cashier',
        hire_date: null,
        is_active: true,
        notes: '',
    });

    const handleSearch = (value) => {
        setSearch(value);
        router.get(route('workers.index'), { search: value }, { preserveState: true });
    };

    const openCreateDialog = () => {
        reset();
        setEditingWorker(null);
        setDialogOpen(true);
    };

    const openEditDialog = (worker) => {
        setEditingWorker(worker);
        setData({
            name: worker.name,
            phone: worker.phone || '',
            role: worker.role,
            hire_date: worker.hire_date ? dayjs(worker.hire_date) : null,
            is_active: worker.is_active,
            notes: worker.notes || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            ...data,
            hire_date: data.hire_date ? data.hire_date.format('YYYY-MM-DD') : null,
        };

        if (editingWorker) {
            put(route('workers.update', editingWorker.id), {
                data: formData,
                onSuccess: () => {
                    toast.success(t('Employé mis à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('workers.store'), {
                data: formData,
                onSuccess: () => {
                    toast.success(t('Employé créé avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (worker) => {
        setWorkerToDelete(worker);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('workers.destroy', workerToDelete.id), {
            onSuccess: () => toast.success(t('Employé supprimé avec succès')),
            onError: () => toast.error(t('Erreur lors de la suppression')),
        });
    };

    const roleLabels = {
        manager: t('Gérant'),
        cashier: t('Caissier'),
        warehouse: t('Magasinier'),
        other: t('Autre'),
    };

    return (
        <Layout
            title={t('Employés')}
            breadcrumbs={[{ label: t('Employés') }]}
        >
            <Head title={t('Employés')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Gestion des employés')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >
                    {t('Nouvel employé')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    placeholder={t('Rechercher par nom ou téléphone...')}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Nom')}</TableCell>
                            <TableCell>{t('Téléphone')}</TableCell>
                            <TableCell>{t('Rôle')}</TableCell>
                            <TableCell>{t('Date embauche')}</TableCell>
                            <TableCell>{t('Statut')}</TableCell>
                            <TableCell align="right">{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workers.data?.length > 0 ? (
                            workers.data.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell>{worker.name}</TableCell>
                                    <TableCell>{worker.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={roleLabels[worker.role]}
                                            size="small"
                                            color={worker.role === 'manager' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {worker.hire_date
                                            ? new Date(worker.hire_date).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={worker.is_active ? t('Actif') : t('Inactif')}
                                            size="small"
                                            color={worker.is_active ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => openEditDialog(worker)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(worker)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    {t('Aucun employé trouvé')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {workers.total > workers.per_page && (
                    <TablePagination
                        component="div"
                        count={workers.total}
                        page={workers.current_page - 1}
                        onPageChange={(e, page) =>
                            router.get(route('workers.index'), { page: page + 1 }, { preserveState: true })
                        }
                        rowsPerPage={workers.per_page}
                        rowsPerPageOptions={[workers.per_page]}
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} ${t('sur')} ${count}`
                        }
                    />
                )}
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingWorker ? t('Modifier employé') : t('Nouvel employé')}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label={t('Nom')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                required
                            />
                            <TextField
                                label={t('Téléphone')}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>{t('Rôle')}</InputLabel>
                                <Select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    label={t('Rôle')}
                                >
                                    <MenuItem value="manager">{t('Gérant')}</MenuItem>
                                    <MenuItem value="cashier">{t('Caissier')}</MenuItem>
                                    <MenuItem value="warehouse">{t('Magasinier')}</MenuItem>
                                    <MenuItem value="other">{t('Autre')}</MenuItem>
                                </Select>
                            </FormControl>
                            <DatePicker
                                label={t('Date d\'embauche')}
                                value={data.hire_date}
                                onChange={(value) => setData('hire_date', value)}
                                slotProps={{
                                    textField: { fullWidth: true },
                                }}
                            />
                            <TextField
                                label={t('Notes')}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label={t('Actif')}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} color="inherit">
                            {t('Annuler')}
                        </Button>
                        <Button type="submit" variant="contained" disabled={processing}>
                            {t('Enregistrer')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={t('Supprimer employé')}
                message={t('Êtes-vous sûr de vouloir supprimer cet employé ?')}
            />
        </Layout>
    );
}
