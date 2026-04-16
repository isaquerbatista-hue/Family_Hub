/**
 * Módulo de Autenticação - Family Hub
 * Responsável pela validação e funcionalidades das telas de login e recuperação de senha
 */

// Classe principal do módulo de autenticação
class AuthModule {
    constructor() {
        // Elementos do DOM - Login
        this.loginForm = document.getElementById('login-form');
        this.loginEmailInput = document.getElementById('login-email');
        this.loginPasswordInput = document.getElementById('login-password');
        this.loginBtn = document.getElementById('login-btn');
        this.togglePasswordBtn = document.getElementById('toggle-password');
        this.loginSuccessMessage = document.getElementById('login-success-message');
        
        // Elementos do DOM - Recuperação
        this.recoveryForm = document.getElementById('recovery-form');
        this.recoveryEmailInput = document.getElementById('recovery-email');
        this.recoveryBtn = document.getElementById('recovery-btn');
        this.recoverySuccess = document.getElementById('recovery-success');
        
        // Elementos do DOM - Cadastro
        this.registerForm = document.getElementById('register-form');
        this.registerNameInput = document.getElementById('register-name');
        this.registerEmailInput = document.getElementById('register-email');
        this.registerPasswordInput = document.getElementById('register-password');
        this.registerConfirmPasswordInput = document.getElementById('register-confirm-password');
        this.registerTermsInput = document.getElementById('register-terms');
        this.registerBtn = document.getElementById('register-btn');
        this.registerSuccess = document.getElementById('register-success');
        
        // Botões toggle de senha do cadastro
        this.toggleRegisterPasswordBtn = document.getElementById('toggle-register-password');
        this.toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
        
        // Elementos de validação de senha
        this.passwordRequirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            lowercase: document.getElementById('req-lowercase'),
            number: document.getElementById('req-number')
        };
        
        // Elementos de erro
        this.loginEmailError = document.getElementById('login-email-error');
        this.loginPasswordError = document.getElementById('login-password-error');
        this.recoveryEmailError = document.getElementById('recovery-email-error');
        this.registerNameError = document.getElementById('register-name-error');
        this.registerEmailError = document.getElementById('register-email-error');
        this.registerPasswordError = document.getElementById('register-password-error');
        this.registerConfirmPasswordError = document.getElementById('register-confirm-password-error');
        this.registerTermsError = document.getElementById('register-terms-error');
        
        // Telas
        this.loginScreen = document.getElementById('login-screen');
        this.recoveryScreen = document.getElementById('recovery-screen');
        this.registerScreen = document.getElementById('register-screen');
        
        // Estado do formulário
        this.isLoading = false;
        this.currentScreen = 'login';
        
        // Inicialização
        this.init();
    }
    
    /**
     * Inicializa os event listeners
     */
    init() {
        // Event listeners do formulário de login
        this.loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        
        // Event listeners do formulário de recuperação
        this.recoveryForm.addEventListener('submit', (e) => this.handleRecoverySubmit(e));
        
        // Event listeners do formulário de cadastro
        this.registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        
        // Event listener para mostrar/ocultar senha (login)
        this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());
        
        // Event listeners para mostrar/ocultar senha (cadastro)
        this.toggleRegisterPasswordBtn.addEventListener('click', () => this.toggleRegisterPassword());
        this.toggleConfirmPasswordBtn.addEventListener('click', () => this.toggleConfirmPassword());
        
        // Event listeners para validação em tempo real - Login
        this.loginEmailInput.addEventListener('blur', () => this.validateLoginEmail());
        this.loginEmailInput.addEventListener('input', () => this.clearError('login-email'));
        
        this.loginPasswordInput.addEventListener('blur', () => this.validateLoginPassword());
        this.loginPasswordInput.addEventListener('input', () => this.clearError('login-password'));
        
        // Event listeners para validação em tempo real - Recuperação
        this.recoveryEmailInput.addEventListener('blur', () => this.validateRecoveryEmail());
        this.recoveryEmailInput.addEventListener('input', () => this.clearError('recovery-email'));
        
        // Event listeners para validação em tempo real - Cadastro
        this.registerNameInput.addEventListener('blur', () => this.validateRegisterName());
        this.registerNameInput.addEventListener('input', () => this.clearError('register-name'));
        
        this.registerEmailInput.addEventListener('blur', () => this.validateRegisterEmail());
        this.registerEmailInput.addEventListener('input', () => this.clearError('register-email'));
        
        this.registerPasswordInput.addEventListener('input', () => {
            this.validatePasswordRequirements();
            this.clearError('register-password');
        });
        
        this.registerPasswordInput.addEventListener('blur', () => this.validateRegisterPassword());
        
        this.registerConfirmPasswordInput.addEventListener('blur', () => this.validateRegisterConfirmPassword());
        this.registerConfirmPasswordInput.addEventListener('input', () => this.clearError('register-confirm-password'));
        
        this.registerTermsInput.addEventListener('change', () => this.clearError('register-terms'));
        
        // Event listeners para links auxiliares
        this.setupAuxiliaryLinks();
        
        // Animação de entrada
        this.animateEntrance();
        
        console.log('Módulo de autenticação inicializado com sucesso!');
    }
    
    /**
     * Manipula o envio do formulário de login
     */
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        // Se já está carregando, não permite novo envio
        if (this.isLoading) return;
        
        // Valida o formulário
        if (!this.validateLoginForm()) return;
        
        // Simula processo de login
        await this.simulateLogin();
    }
    
    /**
     * Manipula o envio do formulário de recuperação
     */
    async handleRecoverySubmit(event) {
        event.preventDefault();
        
        // Se já está carregando, não permite novo envio
        if (this.isLoading) return;
        
        // Valida o formulário
        if (!this.validateRecoveryForm()) return;
        
        // Simula processo de recuperação
        await this.simulateRecovery();
    }
    
    /**
     * Manipula o envio do formulário de cadastro
     */
    async handleRegisterSubmit(event) {
        event.preventDefault();
        
        // Se já está carregando, não permite novo envio
        if (this.isLoading) return;
        
        // Valida o formulário
        if (!this.validateRegisterForm()) return;
        
        // Simula processo de cadastro
        await this.simulateRegister();
    }
    
    /**
     * Valida o formulário de login
     */
    validateLoginForm() {
        const isEmailValid = this.validateLoginEmail();
        const isPasswordValid = this.validateLoginPassword();
        
        return isEmailValid && isPasswordValid;
    }
    
    /**
     * Valida o formulário de recuperação
     */
    validateRecoveryForm() {
        return this.validateRecoveryEmail();
    }
    
    /**
     * Valida o formulário de cadastro
     */
    validateRegisterForm() {
        const isNameValid = this.validateRegisterName();
        const isEmailValid = this.validateRegisterEmail();
        const isPasswordValid = this.validateRegisterPassword();
        const isConfirmPasswordValid = this.validateRegisterConfirmPassword();
        const areTermsAccepted = this.validateRegisterTerms();
        
        return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && areTermsAccepted;
    }
    
    /**
     * Valida o campo de email do login
     */
    validateLoginEmail() {
        const email = this.loginEmailInput.value.trim();
        
        // Verifica se está vazio
        if (!email) {
            this.showError('login-email', 'O e-mail é obrigatório');
            return false;
        }
        
        // Verifica formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('login-email', 'Digite um e-mail válido');
            return false;
        }
        
        this.clearError('login-email');
        return true;
    }
    
    /**
     * Valida o campo de senha do login
     */
    validateLoginPassword() {
        const password = this.loginPasswordInput.value;
        
        // Verifica se está vazio
        if (!password) {
            this.showError('login-password', 'A senha é obrigatória');
            return false;
        }
        
        // Verifica tamanho mínimo
        if (password.length < 6) {
            this.showError('login-password', 'A senha deve ter pelo menos 6 caracteres');
            return false;
        }
        
        this.clearError('login-password');
        return true;
    }
    
    /**
     * Valida o campo de email da recuperação
     */
    validateRecoveryEmail() {
        const email = this.recoveryEmailInput.value.trim();
        
        // Verifica se está vazio
        if (!email) {
            this.showError('recovery-email', 'O e-mail é obrigatório');
            return false;
        }
        
        // Verifica formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('recovery-email', 'Digite um e-mail válido');
            return false;
        }
        
        this.clearError('recovery-email');
        return true;
    }
    
    /**
     * Valida o campo de nome do cadastro
     */
    validateRegisterName() {
        const name = this.registerNameInput.value.trim();
        
        // Verifica se está vazio
        if (!name) {
            this.showError('register-name', 'O nome é obrigatório');
            return false;
        }
        
        // Verifica tamanho mínimo
        if (name.length < 3) {
            this.showError('register-name', 'O nome deve ter pelo menos 3 caracteres');
            return false;
        }
        
        this.clearError('register-name');
        return true;
    }
    
    /**
     * Valida o campo de email do cadastro
     */
    validateRegisterEmail() {
        const email = this.registerEmailInput.value.trim();
        
        // Verifica se está vazio
        if (!email) {
            this.showError('register-email', 'O e-mail é obrigatório');
            return false;
        }
        
        // Verifica formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('register-email', 'Digite um e-mail válido');
            return false;
        }
        
        this.clearError('register-email');
        return true;
    }
    
    /**
     * Valida o campo de senha do cadastro
     */
    validateRegisterPassword() {
        const password = this.registerPasswordInput.value;
        
        // Verifica se está vazio
        if (!password) {
            this.showError('register-password', 'A senha é obrigatória');
            return false;
        }
        
        // Verifica requisitos de senha
        const requirements = this.checkPasswordRequirements(password);
        if (!requirements.isValid) {
            this.showError('register-password', 'A senha não atende aos requisitos');
            return false;
        }
        
        this.clearError('register-password');
        return true;
    }
    
    /**
     * Valida o campo de confirmar senha
     */
    validateRegisterConfirmPassword() {
        const password = this.registerPasswordInput.value;
        const confirmPassword = this.registerConfirmPasswordInput.value;
        
        // Verifica se está vazio
        if (!confirmPassword) {
            this.showError('register-confirm-password', 'Confirme sua senha');
            return false;
        }
        
        // Verifica se as senhas coincidem
        if (password !== confirmPassword) {
            this.showError('register-confirm-password', 'As senhas não coincidem');
            return false;
        }
        
        this.clearError('register-confirm-password');
        return true;
    }
    
    /**
     * Valida aceite dos termos
     */
    validateRegisterTerms() {
        if (!this.registerTermsInput.checked) {
            this.showError('register-terms', 'Você deve aceitar os termos para continuar');
            return false;
        }
        
        this.clearError('register-terms');
        return true;
    }
    
    /**
     * Mostra mensagem de erro
     */
    showError(field, message) {
        const inputWrapper = this.getInputWrapper(field);
        const errorElement = this.getErrorElement(field);
        
        // Adiciona classe de erro
        inputWrapper.classList.add('error');
        
        // Mostra mensagem de erro
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    /**
     * Limpa mensagem de erro
     */
    clearError(field) {
        const inputWrapper = this.getInputWrapper(field);
        const errorElement = this.getErrorElement(field);
        
        // Remove classe de erro
        inputWrapper.classList.remove('error');
        
        // Esconde mensagem de erro
        errorElement.classList.remove('show');
    }
    
    /**
     * Obtém o wrapper do input
     */
    getInputWrapper(field) {
        if (field === 'email') {
            return this.emailInput.parentElement;
        } else if (field === 'password') {
            return this.passwordInput.parentElement;
        }
    }
    
    /**
     * Obtém o elemento de erro
     */
    getErrorElement(field) {
        if (field === 'email') {
            return this.emailError;
        } else if (field === 'password') {
            return this.passwordError;
        }
    }
    
    /**
     * Alterna visibilidade da senha (login)
     */
    togglePassword() {
        const isPassword = this.loginPasswordInput.type === 'password';
        
        if (isPassword) {
            this.loginPasswordInput.type = 'text';
            this.togglePasswordBtn.classList.add('password-visible');
            this.togglePasswordBtn.title = 'Ocultar senha';
        } else {
            this.loginPasswordInput.type = 'password';
            this.togglePasswordBtn.classList.remove('password-visible');
            this.togglePasswordBtn.title = 'Mostrar senha';
        }
        
        // Foco no input após alternar
        this.loginPasswordInput.focus();
    }
    
    /**
     * Alterna visibilidade da senha (cadastro)
     */
    toggleRegisterPassword() {
        const isPassword = this.registerPasswordInput.type === 'password';
        
        if (isPassword) {
            this.registerPasswordInput.type = 'text';
            this.toggleRegisterPasswordBtn.classList.add('password-visible');
            this.toggleRegisterPasswordBtn.title = 'Ocultar senha';
        } else {
            this.registerPasswordInput.type = 'password';
            this.toggleRegisterPasswordBtn.classList.remove('password-visible');
            this.toggleRegisterPasswordBtn.title = 'Mostrar senha';
        }
        
        // Foco no input após alternar
        this.registerPasswordInput.focus();
    }
    
    /**
     * Alterna visibilidade da confirmação de senha
     */
    toggleConfirmPassword() {
        const isPassword = this.registerConfirmPasswordInput.type === 'password';
        
        if (isPassword) {
            this.registerConfirmPasswordInput.type = 'text';
            this.toggleConfirmPasswordBtn.classList.add('password-visible');
            this.toggleConfirmPasswordBtn.title = 'Ocultar senha';
        } else {
            this.registerConfirmPasswordInput.type = 'password';
            this.toggleConfirmPasswordBtn.classList.remove('password-visible');
            this.toggleConfirmPasswordBtn.title = 'Mostrar senha';
        }
        
        // Foco no input após alternar
        this.registerConfirmPasswordInput.focus();
    }
    
    /**
     * Simula processo de login
     */
    async simulateLogin() {
        const email = this.loginEmailInput.value.trim();
        const password = this.loginPasswordInput.value;
        
        // Estado de carregamento
        this.setLoading(true, 'login');
        
        try {
            // Simula delay de requisição (2 segundos)
            await this.delay(2000);
            
            // Simula validação de credenciais
            if (this.isValidCredentials(email, password)) {
                this.showLoginSuccess();
                this.logLoginAttempt(email, true);
                
                // Redireciona após sucesso (simulação)
                setTimeout(() => {
                    console.log('Redirecionando para o dashboard...');
                    // window.location.href = '../index.html';
                }, 1500);
            } else {
                this.showError('login-password', 'E-mail ou senha incorretos');
                this.logLoginAttempt(email, false);
            }
        } catch (error) {
            console.error('Erro no processo de login:', error);
            this.showError('login-password', 'Ocorreu um erro. Tente novamente.');
        } finally {
            this.setLoading(false, 'login');
        }
    }
    
    /**
     * Simula processo de recuperação de senha
     */
    async simulateRecovery() {
        const email = this.recoveryEmailInput.value.trim();
        
        // Estado de carregamento
        this.setLoading(true, 'recovery');
        
        try {
            // Simula delay de requisição (2 segundos)
            await this.delay(2000);
            
            // Simula envio de email
            this.showRecoverySuccess();
            this.logRecoveryAttempt(email);
            
        } catch (error) {
            console.error('Erro no processo de recuperação:', error);
            this.showError('recovery-email', 'Ocorreu um erro. Tente novamente.');
        } finally {
            this.setLoading(false, 'recovery');
        }
    }
    
    /**
     * Simula processo de cadastro
     */
    async simulateRegister() {
        const name = this.registerNameInput.value.trim();
        const email = this.registerEmailInput.value.trim();
        const password = this.registerPasswordInput.value;
        
        // Estado de carregamento
        this.setLoading(true, 'register');
        
        try {
            // Simula delay de requisição (2 segundos)
            await this.delay(2000);
            
            // Simula criação de conta
            this.showRegisterSuccess();
            this.logRegisterAttempt({ name, email });
            
        } catch (error) {
            console.error('Erro no processo de cadastro:', error);
            this.showError('register-email', 'Ocorreu um erro. Tente novamente.');
        } finally {
            this.setLoading(false, 'register');
        }
    }
    
    /**
     * Verifica se as credenciais são válidas (simulação)
     */
    isValidCredentials(email, password) {
        // Credenciais de demonstração
        const validCredentials = [
            { email: 'admin@familyhub.com', password: 'admin123' },
            { email: 'user@familyhub.com', password: 'user123' },
            { email: 'demo@familyhub.com', password: 'demo123' }
        ];
        
        return validCredentials.some(cred => 
            cred.email === email.toLowerCase() && cred.password === password
        );
    }
    
    /**
     * Define estado de carregamento
     */
    setLoading(loading, form) {
        this.isLoading = loading;
        
        if (form === 'login') {
            const btnText = this.loginBtn.querySelector('.btn-text');
            const btnLoader = this.loginBtn.querySelector('.btn-loader');
            
            if (loading) {
                this.loginBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
            } else {
                this.loginBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        } else if (form === 'recovery') {
            const btnText = this.recoveryBtn.querySelector('.btn-text');
            const btnLoader = this.recoveryBtn.querySelector('.btn-loader');
            
            if (loading) {
                this.recoveryBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
            } else {
                this.recoveryBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        } else if (form === 'register') {
            const btnText = this.registerBtn.querySelector('.btn-text');
            const btnLoader = this.registerBtn.querySelector('.btn-loader');
            
            if (loading) {
                this.registerBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
            } else {
                this.registerBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        }
    }
    
    /**
     * Mostra mensagem de sucesso do login
     */
    showLoginSuccess() {
        // Esconde formulário
        this.loginForm.style.display = 'none';
        
        // Mostra mensagem de sucesso
        this.loginSuccessMessage.style.display = 'flex';
        
        // Adiciona animação
        this.loginSuccessMessage.style.animation = 'slideUp 0.5s ease-out';
    }
    
    /**
     * Mostra mensagem de sucesso da recuperação
     */
    showRecoverySuccess() {
        // Esconde formulário
        this.recoveryForm.style.display = 'none';
        
        // Mostra mensagem de sucesso
        this.recoverySuccess.style.display = 'block';
        
        // Adiciona animação
        this.recoverySuccess.style.animation = 'slideUp 0.5s ease-out';
    }
    
    /**
     * Mostra mensagem de sucesso do cadastro
     */
    showRegisterSuccess() {
        // Esconde formulário
        this.registerForm.style.display = 'none';
        
        // Mostra mensagem de sucesso
        this.registerSuccess.style.display = 'block';
        
        // Adiciona animação
        this.registerSuccess.style.animation = 'slideUp 0.5s ease-out';
    }
    
    /**
     * Configura os links auxiliares
     */
    setupAuxiliaryLinks() {
        // Links para alternar entre telas
        const screenLinks = document.querySelectorAll('[data-screen]');
        screenLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetScreen = link.getAttribute('data-screen');
                this.switchScreen(targetScreen);
            });
        });
        
        // Links para termos e privacidade
        const termsLink = document.querySelector('.terms-link');
        const privacyLink = document.querySelector('.privacy-link');
        
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Termos de uso em desenvolvimento');
            });
        }
        
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Política de privacidade em desenvolvimento');
            });
        }
    }
    
    /**
     * Alterna entre as telas de login, recuperação e cadastro
     */
    switchScreen(targetScreen) {
        if (this.isLoading) return;
        
        const screenMap = {
            'login': this.loginScreen,
            'recovery': this.recoveryScreen,
            'register': this.registerScreen
        };
        
        const currentScreenElement = screenMap[this.currentScreen];
        const targetScreenElement = screenMap[targetScreen];
        
        // Adiciona classe de saída
        currentScreenElement.classList.add('slide-out');
        currentScreenElement.classList.remove('active');
        
        // Após a animação de saída, mostra a nova tela
        setTimeout(() => {
            targetScreenElement.classList.remove('slide-out');
            targetScreenElement.classList.add('active');
            this.currentScreen = targetScreen;
            
            // Limpa formulários e erros
            this.clearAllErrors();
            
            // Reset e controle de visibilidade dos formulários
            this.loginForm.reset();
            this.loginForm.style.display = 'flex';
            
            this.recoveryForm.reset();
            this.recoveryForm.style.display = 'none';
            this.recoverySuccess.style.display = 'none';
            
            this.registerForm.reset();
            this.registerForm.style.display = 'none';
            this.registerSuccess.style.display = 'none';
            
            // Mostra o formulário correto
            if (targetScreen === 'login') {
                this.loginForm.style.display = 'flex';
            } else if (targetScreen === 'recovery') {
                this.recoveryForm.style.display = 'flex';
            } else if (targetScreen === 'register') {
                this.registerForm.style.display = 'flex';
                // Reset validação de senha
                this.resetPasswordRequirements();
            }
        }, 300);
    }
    
    /**
     * Mostra notificação temporária
     */
    showNotification(message) {
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-panel);
            color: var(--text-primary);
            padding: 16px 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Adiciona ao DOM
        document.body.appendChild(notification);
        
        // Remove após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Animação de entrada dos elementos
     */
    animateEntrance() {
        // Adiciona animação aos elementos do formulário de login
        const loginElements = this.loginForm.querySelectorAll('.form-group, .login-btn, .login-links');
        loginElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    /**
     * Registra tentativa de login (para debugging)
     */
    logLoginAttempt(email, success) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Ofusca parte do email
            success,
            userAgent: navigator.userAgent
        };
        
        console.log('Tentativa de login:', logEntry);
    }
    
    /**
     * Função utilitária para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Verifica requisitos de senha em tempo real
     */
    validatePasswordRequirements() {
        const password = this.registerPasswordInput.value;
        const requirements = this.checkPasswordRequirements(password);
        
        // Atualiza visual dos requisitos
        this.passwordRequirements.length.classList.toggle('valid', requirements.length);
        this.passwordRequirements.uppercase.classList.toggle('valid', requirements.uppercase);
        this.passwordRequirements.lowercase.classList.toggle('valid', requirements.lowercase);
        this.passwordRequirements.number.classList.toggle('valid', requirements.number);
        
        return requirements.isValid;
    }
    
    /**
     * Verifica se a senha atende aos requisitos
     */
    checkPasswordRequirements(password) {
        return {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            isValid: password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
        };
    }
    
    /**
     * Reseta visual dos requisitos de senha
     */
    resetPasswordRequirements() {
        Object.values(this.passwordRequirements).forEach(req => {
            req.classList.remove('valid');
        });
    }
    
    /**
     * Limpa todos os erros
     */
    clearAllErrors() {
        this.clearError('login-email');
        this.clearError('login-password');
        this.clearError('recovery-email');
        this.clearError('register-name');
        this.clearError('register-email');
        this.clearError('register-password');
        this.clearError('register-confirm-password');
        this.clearError('register-terms');
    }
    
    /**
     * Registra tentativa de recuperação (para debugging)
     */
    logRecoveryAttempt(email) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Ofusca parte do email
            type: 'recovery',
            userAgent: navigator.userAgent
        };
        
        console.log('Tentativa de recuperação de senha:', logEntry);
    }
    
    /**
     * Registra tentativa de cadastro (para debugging)
     */
    logRegisterAttempt(data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            name: data.name,
            email: data.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Ofusca parte do email
            type: 'register',
            userAgent: navigator.userAgent
        };
        
        console.log('Tentativa de cadastro:', logEntry);
    }
    
    /**
     * Limpa recursos ao destruir o módulo
     */
    destroy() {
        // Remove event listeners
        this.loginForm.removeEventListener('submit', this.handleLoginSubmit);
        this.recoveryForm.removeEventListener('submit', this.handleRecoverySubmit);
        this.togglePasswordBtn.removeEventListener('click', this.togglePassword);
        
        // Limpa referências
        this.loginForm = null;
        this.recoveryForm = null;
        this.registerForm = null;
        this.loginEmailInput = null;
        this.loginPasswordInput = null;
        this.recoveryEmailInput = null;
        this.registerNameInput = null;
        this.registerEmailInput = null;
        this.registerPasswordInput = null;
        this.registerConfirmPasswordInput = null;
        this.registerTermsInput = null;
        this.loginBtn = null;
        this.recoveryBtn = null;
        this.registerBtn = null;
        this.togglePasswordBtn = null;
        this.toggleRegisterPasswordBtn = null;
        this.toggleConfirmPasswordBtn = null;
        this.loginSuccessMessage = null;
        this.recoverySuccess = null;
        this.registerSuccess = null;
        this.loginEmailError = null;
        this.loginPasswordError = null;
        this.recoveryEmailError = null;
        this.registerNameError = null;
        this.registerEmailError = null;
        this.registerPasswordError = null;
        this.registerConfirmPasswordError = null;
        this.registerTermsError = null;
        this.loginScreen = null;
        this.recoveryScreen = null;
        this.registerScreen = null;
        this.passwordRequirements = null;
    }
}

// Adiciona estilos CSS para animações adicionais
const additionalStyles = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .notification {
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        font-size: 14px;
    }
`;

// Adiciona estilos ao head se não existirem
if (!document.querySelector('#login-additional-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'login-additional-styles';
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
}

// Inicializa o módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se está na página de login
    if (document.querySelector('.login-container')) {
        window.authModule = new AuthModule();
        
        // Adiciona handler para limpeza
        window.addEventListener('beforeunload', () => {
            if (window.authModule) {
                window.authModule.destroy();
            }
        });
        
        console.log('Página de autenticação carregada com sucesso!');
    }
});

// Exporta a classe para uso em outros módulos
export { AuthModule };
