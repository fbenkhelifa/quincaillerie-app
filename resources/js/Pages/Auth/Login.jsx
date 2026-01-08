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

export default function Login({ status, canResetPassword }) {
    const { t } = useContext(AppContext);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <Container maxWidth="sm">
            <Head title={t('Connexion')} />
            
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
                        {t('Connexion')}
                    </Typography>

                    {status && (
                        <Typography color="success.main" sx={{ mb: 2 }} textAlign="center">
                            {status}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label={t('Email')}
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                                required
                                autoFocus
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
                            
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={processing}
                            >
                                {t('Se connecter')}
                            </Button>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {canResetPassword && (
                                    <Link href={route('password.request')}>
                                        <Typography variant="body2" color="primary">
                                            {t('Mot de passe oublié ?')}
                                        </Typography>
                                    </Link>
                                )}
                                <Link href={route('register')}>
                                    <Typography variant="body2" color="primary">
                                        {t('Créer un compte')}
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
