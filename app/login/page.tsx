"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          toast.error(`Erro ao registrar: ${error.message}`);
        } else {
          toast.success("Cadastro realizado! Verifique seu e-mail.");
          setEmail("");
          setPassword("");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(`Erro ao fazer login: ${error.message}`);
        } else {
          toast.success("Login realizado! Redirecionando...");
          router.push("/app/dashboard");
        }
      }
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💰</h1>
          <h2 className="text-3xl font-bold text-gray-800">Boletos</h2>
          <p className="text-lg text-gray-600 mt-2">Controle compartilhado em família</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            disabled={loading}
          />

          <Button
            type="submit"
            size="lg"
            disabled={loading}
          >
            {loading ? "Aguarde..." : isSignUp ? "Cadastrar" : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-lg mb-4">
            {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
              setEmail("");
              setPassword("");
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold text-lg underline"
          >
            {isSignUp ? "Fazer login" : "Cadastrar-se"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-base">
            👨‍👩‍👧 Crie uma conta para compartilhar boletos com sua família
          </p>
        </div>
      </Card>
    </div>
  );
}
