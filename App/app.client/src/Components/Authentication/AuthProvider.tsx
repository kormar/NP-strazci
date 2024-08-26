import { User, signIn, signOut } from '../../Services/UserService';
import { Ranger, getCurrentRanger } from '../../Services/RangerService';
import  { createContext, useContext, ReactNode, useState, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import useDistrict from '../DistrictContext/DistrictDataProvider';

interface AuthContextType {
    user: User | undefined,
    ranger: Ranger | undefined,
    districtId: number | undefined,
    // routes, vehicles, rangers, somehow plans?
    loading: boolean,
    error: any,
    signin: (email: string, password: string) => void,
    signout: () => void,
    authorizedEdit: (planOwner : Ranger) => boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [ranger, setRanger] = useState<Ranger | undefined>(undefined);
    const [districtId, setDistrictId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>();
    const navigate = useNavigate();
    const { assignDistrict, clearDistrict } = useDistrict();

    //TODO clearing errors - manual by calling a function/ when changing routes/ when unmounting?

    //TODO get current user from database if there is an active session/4
    async function signin(email: string, password: string) {
        setLoading(true);
        try {
            const user = await signIn(email, password);
            const ranger = await getCurrentRanger();
            if (ranger != undefined) {
                setDistrictId(ranger.districtId);
                assignDistrict(ranger.districtId);
            }
            setUser(user);
            setRanger(ranger);
            navigate("/");
        }
        catch (error) {
            setError(error);
        }
        finally {
            setLoading(false);
        }
    }
    async function signout() {
        signOut()
            .then( () =>{
                setUser(undefined);
                setDistrictId(undefined);
                setRanger(undefined);
                clearDistrict();
            })
    }
    function authorizedEdit(planOwner : Ranger) : boolean{
        if (planOwner.id == ranger?.id) {
            return true;
        }
        else if (user?.role == "HeadOfDistrict" && districtId == planOwner.districtId) {
            return true;
        }
        return false;
    }

    const memoValue = useMemo(
        () => ({
            user,
            ranger,
            districtId,
            loading,
            error,
            signin,
            signout,
            authorizedEdit
        }),
        [user, ranger, districtId, loading, error]
    );

    return (
        <AuthContext.Provider value={memoValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}