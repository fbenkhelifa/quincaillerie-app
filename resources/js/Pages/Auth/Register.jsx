import { useContext, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Container,
} from '@mui/material';

export default function Register() {
    const { t } = useContext(AppContext);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <Container maxWidth="sm">
            <Head title={t('Inscription')} />
            
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                        🔧 Quincaillerie
                    </Typography>
                    <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
                        {t('Créer un compte')}
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label={t('Nom')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                required
                                autoFocus
                            />
                            <TextField
                                label={t('Email')}
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                                required
                            />
                            <TextField
                                label={t('Mot de passe')}
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                                fullWidth
                                required
                            />
                            <TextField
                                label={t('Confirmer le mot de passe')}
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                                fullWidth
                                required
                            />
                            
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={processing}
                            >
                                {t('S\'inscrire')}
                            </Button>
                            
                            <Box sx={{ textAlign: 'center' }}>
                                <Link href={route('login')}>
                                    <Typography variant="body2" color="primary">
                                        {t('Déjà inscrit ? Se connecter')}
                                    </Typography>
                                </Link>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}
