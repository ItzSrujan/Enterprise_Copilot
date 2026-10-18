from pydantic import BaseModel, EmailStr, Field, ConfigDict

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length = 8, max_length = 128)
    
class TokenRequest(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    
    model_config = ConfigDict(from_attributes = True)